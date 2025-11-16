import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getFirstLastDayYear } from 'src/helpers/calculateEveryone';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { FilterDateDto, StatusQueryDto } from 'src/shared/dto/queries.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { CreateWaterMeterDto } from './dto/create-water-meter.dto';
import { UpdateWaterMeterDto } from './dto/update-water-meter.dto';
import { WaterMeter } from './entities/water-meter.entity';

@Injectable()
export class WaterMetersService {
  constructor(
    @InjectRepository(WaterMeter)
    private waterMeterRepository: Repository<WaterMeter>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(body: CreateWaterMeterDto) {
    if (await this.findOneByMeterNumberRaw(body.meter_number))
      throw new NotFoundException(
        `El medidor de agua ${body.meter_number} ya existe`,
      );
    // Buscar el usuario antes de insertar
    const findUser = await this.findUserByIdStatusTrue(body.user_id);
    const newWaterMeter = this.waterMeterRepository.create(body);
    newWaterMeter.user = findUser;
    const {
      user: {
        password,
        accessToken,
        refreshToken,
        emailVerified,
        codeVerification,
        phoneVerified,
        authProvider,
        ...user
      },
      ...waterMeter
    } = await this.waterMeterRepository.save(newWaterMeter);
    return { ...user, waterMeter };
  }

  async createOnlyMeter(body: CreateWaterMeterDto) {
    // Buscar el medidor antes de insertar
    if (await this.findOneByMeterNumberRaw(body.meter_number))
      throw new NotFoundException(
        `El medidor de agua ${body.meter_number} ya existe`,
      );
    // Buscar usuario existente y activo
    const user = await this.findUserByIdStatusTrue(body.user_id);
    // Busca un usuario por CI, si existe reutiliza sus datos
    const newWaterMeter = this.waterMeterRepository.create(body);
    newWaterMeter.user = user; // Asigna el id de usuario al medidor
    return await this.waterMeterRepository.save(newWaterMeter);
  }

  async findAll(pagination: PaginationDto, statusValue: StatusQueryDto) {
    let { limit, offset } = pagination;
    limit = limit ? limit : 20;
    offset = offset ? offset : 0;
    const { status } = statusValue;

    const baseQuery =
      this.waterMeterRepository.createQueryBuilder('waterMeter');
    if (status !== undefined) baseQuery.where({ status });
    baseQuery.orderBy('waterMeter.createdAt', 'DESC');
    baseQuery.leftJoinAndSelect('waterMeter.user', 'user');
    baseQuery.select([
      'waterMeter._id',
      'waterMeter.meter_number',
      'waterMeter.status',
      'waterMeter.createdAt',
      'waterMeter.updatedAt',
      'waterMeter.deletedAt',
      'waterMeter.user_id', // ← NECESARIO
      'user._id', // ← NECESARIO
      'user.ci',
      'user.name',
      'user.surname',
      'user.email',
      'user.phoneNumber',
      'user.profileImg',
      'user.status',
    ]);
    baseQuery.skip(offset);
    baseQuery.take(limit);

    const waterMeters = await baseQuery.clone().getMany();
    const total = await baseQuery.clone().getCount();
    return { limit, offset, total, waterMeters };
  }

  async findAllReadingOneMonth(
    pagination: PaginationDto,
    date: FilterDateDto,
    status?: boolean,
  ) {
    const { limit, offset } = pagination;
    const { startDate, endDate } = date;
    if (status !== null) {
      return await this.waterMeterRepository
        .createQueryBuilder('waterMeter')
        .leftJoinAndSelect('waterMeter.meterReadings', 'meter_reading')
        .where('waterMeter.status = :status', { status })
        .andWhere('meter_reading.date >= :startDate', { startDate })
        .andWhere('meter_reading.date <= :endDate', { endDate })
        .limit(limit)
        .offset(offset)
        .getMany();
    }
  }

  async findOneByMeterNumber(meter_number: number) {
    const meter = await this.waterMeterRepository.findOneBy({ meter_number });
    if (!meter)
      throw new NotFoundException(
        `Medidor de agua ${meter_number} no encontrado`,
      );
    return meter;
  }

  async findOneByCI(ci: number) {
    const meters = await this.waterMeterRepository.findOne({
      where: { _id: '' },
    });
    if (meters) {
      throw new NotFoundException(`La ci ${ci} no esta registrado`);
    }
    return meters;
  }

  async findOneByCIRaw(ci: number) {
    return await this.waterMeterRepository.findOne({ where: { _id: '' } });
  }

  async findManyByCI(ci: number) {
    const meters = await this.waterMeterRepository.findBy({ _id: '' });
    if (meters?.length === 0) {
      throw new NotFoundException(`No hay medidores registrados ${ci}`);
    }
    return meters;
  }

  async findOneByMeterNumberRaw(meter_number: number) {
    return await this.waterMeterRepository.findOneBy({
      meter_number,
    });
  }

  async findOneByIdRaw(id: string) {
    return await this.waterMeterRepository.findOneBy({ _id: id });
  }

  async listMReadingsOneYear(date: Date) {
    const { startDateY, endDateY } = getFirstLastDayYear(date);
    console.log(startDateY, endDateY);
    const meters = await this.waterMeterRepository
      .createQueryBuilder('waterMeter')
      .leftJoinAndSelect('waterMeter.meterReadings', 'meter_reading')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .where('meter_reading.date >= :startDateY', {
        startDateY,
      })
      .andWhere('meter_reading.date <= :endDateY', {
        endDateY,
      })
      .getMany();
    // console.log(meters);

    return meters;
  }

  async findOneById(id: string) {
    const baseQuery =
      this.waterMeterRepository.createQueryBuilder('waterMeter');
    baseQuery.leftJoinAndSelect('waterMeter.user', 'user');
    baseQuery.where('waterMeter._id = :id', { id });
    baseQuery.select([
      'waterMeter._id',
      'waterMeter.meter_number',
      'waterMeter.status',
      'waterMeter.createdAt',
      'waterMeter.updatedAt',
      'waterMeter.deletedAt',
      'waterMeter.user_id', // ← NECESARIO
      'user._id', // ← NECESARIO
      'user.ci',
      'user.name',
      'user.surname',
      'user.status',
    ]);

    const meter = await baseQuery.clone().getOne();
    if (!meter)
      throw new NotFoundException(`Medidor de agua ${id} no registrado`);
    return meter;
  }

  async findUserByIdStatusTrue(user_id: string) {
    const user = await this.userRepository.findOne({
      where: { _id: user_id, status: true },
    });
    if (!user) throw new NotFoundException(`Usuario ${user_id} no registrado`);
    return user;
  }

  async update(id: string, body: UpdateWaterMeterDto) {
    const waterMeter = await this.waterMeterRepository.findOneBy({ _id: id });
    if (!waterMeter)
      throw new NotFoundException(`Medidor de agua ${id} no encontrado`);
    if (body.user_id)
      waterMeter.user = await this.findUserByIdStatusTrue(body.user_id);
    Object.assign(waterMeter, body);
    console.log(waterMeter);
    return await this.waterMeterRepository.save(waterMeter);
  }

  remove(id: string) {
    return `This action removes a #${id} waterMeter`;
  }

  // ------------------------------------------------------------------------
  // ANNUAL REPORT BY METER
  // ------------------------------------------------------------------------
  async annualReportByMeter(dates: FilterDateDto) {
    const { startDate, endDate } = dates;
    if (!startDate || !endDate)
      throw new BadRequestException('Fecha de inicio y fin son requeridas');

    const baseQuery = this.waterMeterRepository
      .createQueryBuilder('waterMeter')
      .leftJoin('waterMeter.meterReadings', 'meter_reading')
      .leftJoin('meter_reading.invoice', 'invoice')
      .where('meter_reading.date >= :startDate', { startDate })
      .andWhere('meter_reading.date <= :endDate', { endDate });

    const [readings, totalMeters] = await this.waterMeterRepository
      .createQueryBuilder('waterMeter')
      .leftJoin('waterMeter.meterReadings', 'meter_reading')
      .leftJoin('meter_reading.invoice', 'invoice')
      .where('meter_reading.date >= :startDate', { startDate })
      .andWhere('meter_reading.date <= :endDate', { endDate })
      .select([
        // Campos del waterMeter necesarios para construir el objeto
        // 'waterMeter._id',
        'waterMeter.ci',
        'waterMeter.name',
        'waterMeter.surname',
        'waterMeter.meter_number',
        'waterMeter.status',
        // Campos del meter_reading necesarios
        'meter_reading._id',
        'meter_reading.date',
        'meter_reading.cubicMeters',
        'meter_reading.balance',
        // Campos del invoice necesarios
        'invoice._id',
        'invoice.amountDue',
        'invoice.isPaid',
        'invoice.status',
      ])
      .orderBy('meter_reading.date', 'ASC')
      .getManyAndCount();

    const summary = await baseQuery
      .clone()
      .select([
        'SUM(meter_reading.cubicMeters) as totalCubes',
        'SUM(invoice.amountDue) as totalBilled',
        'SUM(CASE WHEN invoice.isPaid = false THEN invoice.amountDue ELSE 0 END) as pendingAmount',
        'SUM(CASE WHEN invoice.isPaid = true THEN invoice.amountDue ELSE 0 END) as paidAmount',
      ])
      .getRawOne<{
        totalCubes: string;
        totalBilled: string;
        pendingAmount: string;
        paidAmount: string;
      }>();

    return {
      period: {
        startDate,
        endDate,
      },
      year: startDate.getFullYear(),
      summary: {
        totalMeters,
        totalCubes: Number(summary?.totalCubes ?? 0),
        totalBilled: Number(summary?.totalBilled ?? 0),
        pendingAmount: Number(summary?.pendingAmount ?? 0),
        paidAmount: Number(summary?.paidAmount ?? 0),
      },
      readings,
    };
  }
}
