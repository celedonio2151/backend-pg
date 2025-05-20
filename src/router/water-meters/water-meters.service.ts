import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWaterMeterDto } from './dto/create-water-meter.dto';
import { UpdateWaterMeterDto } from './dto/update-water-meter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WaterMeter } from './entities/water-meter.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/router/user/user.service';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import {
  getFirstLastDayMonth,
  getFirstLastDayYear,
} from 'src/helpers/calculateEveryone';
import { FilterDateDto } from 'src/shared/dto/queries.dto';

@Injectable()
export class WaterMetersService {
  constructor(
    @InjectRepository(WaterMeter)
    private waterMeterRepository: Repository<WaterMeter>,
    // private userService: UsersService,
  ) {}

  async create(body: CreateWaterMeterDto) {
    if (await this.findOneByMeterNumberRaw(body.meter_number))
      throw new NotFoundException(
        `El medidor de agua ${body.meter_number} ya existe`,
      );
    // Buscar el usuario antes de insertar
    const waterMeter = await this.waterMeterRepository.create(body);
    return this.waterMeterRepository.save(waterMeter);
  }
  async createOnlyMeter(body: CreateWaterMeterDto) {
    // Buscar el usuario antes de insertar
    if (await this.findOneByMeterNumberRaw(body.meter_number))
      throw new NotFoundException(
        `El medidor de agua ${body.meter_number} ya existe`,
      );
    const waterMeter = await this.findOneByCIRaw(body.ci);
    if (waterMeter) {
      const newWaterMeter = await this.waterMeterRepository.create({
        ...body,
        name: waterMeter.name,
        surname: waterMeter.surname,
      });
      return this.waterMeterRepository.save(newWaterMeter);
    }
  }

  async findAll(pagination: PaginationDto, status?: boolean) {
    const { limit, offset } = pagination;
    const [waterMeters, total] = await this.waterMeterRepository.findAndCount({
      where: { status },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });
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
    const meters = await this.waterMeterRepository.findOne({ where: { ci } });
    if (meters) {
      throw new NotFoundException(`La ci ${ci} no esta registrado`);
    }
    return meters;
  }

  async findOneByCIRaw(ci: number) {
    return await this.waterMeterRepository.findOne({ where: { ci } });
  }

  async findManyByCI(ci: number) {
    const meters = await this.waterMeterRepository.findBy({ ci });
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
    const meter = await this.waterMeterRepository.findOneBy({ _id: id });
    if (!meter)
      throw new NotFoundException(`Medidor de agua ${id} no registrado`);
    return meter;
  }

  async update(id: string, updateWaterMeterDto: UpdateWaterMeterDto) {
    const waterMeter = await this.waterMeterRepository.findOneBy({ _id: id });
    if (!waterMeter)
      throw new NotFoundException(`Medidor de agua ${id} no encontrado`);
    const updateData = {
      status: updateWaterMeterDto.status,
    };
    Object.assign(waterMeter, updateData);
    console.log(waterMeter);
    return await this.waterMeterRepository.save(waterMeter);
  }

  remove(id: string) {
    return `This action removes a #${id} waterMeter`;
  }
}
