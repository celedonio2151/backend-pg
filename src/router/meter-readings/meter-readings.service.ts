import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';
import { UpdateMeterReadingDto } from './dto/update-meter-reading.dto';
import { MeterReading } from './entities/meter-reading.entity';
import { WaterMetersService } from 'src/router/water-meters/water-meters.service';
import { getFirstLastDayMonth } from 'src/helpers/calculateEveryone';
import {
  FilterDateDto,
  Order,
  OrderQueryDTO,
} from 'src/shared/dto/queries.dto';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { BillingService } from 'src/router/billing/billing.service';

@Injectable()
export class MeterReadingsService {
  constructor(
    @InjectRepository(MeterReading)
    private meterReadingRepository: Repository<MeterReading>,
    private waterMeterService: WaterMetersService,
    private billingService: BillingService,
  ) {}
  // ========== CREATE A NEW METER READINGS ===========
  async create(
    body: CreateMeterReadingDto,
    file: Express.Multer.File,
  ): Promise<MeterReading> {
    console.log('🚀 ~ MeterReadingsService ~ body:', body);
    const waterMeter = await this.waterMeterService.findOneById(
      body.water_meterId,
    ); // Find the water meter
    const dateParsed = new Date(body.date);
    const existMonth = await this.findRepeatReadingsMonth(
      body.water_meterId,
      dateParsed,
    );
    if (existMonth) {
      throw new NotAcceptableException(`Ya se lecturo para este mes`);
    }
    // Verificar que el valor no debe ser inferior al anterior
    const beforeMonthAux = JSON.parse(body.beforeMonth);
    if (beforeMonthAux.meterValue > body.lastMonthValue) {
      throw new NotAcceptableException(
        `El valor ${body.lastMonthValue} debe ser mayor al anterior ${beforeMonthAux.meterValue}`,
      );
    }
    const { beforeMonth, lastMonthValue, ...result } = body;
    const beforeV = beforeMonthAux.meterValue;
    const cubicMeters = lastMonthValue - beforeV;
    const body2 = {
      beforeMonth: beforeMonthAux,
      date: body.date,
      lastMonth: {
        date: body.date,
        meterValue: body.lastMonthValue,
      },
      cubicMeters: cubicMeters,
      balance: body.balance || this.calculateBalance(cubicMeters),
      description: body.description || '',
      meterImage: file?.filename,
      waterMeter: waterMeter,
    };

    const newReading = await this.meterReadingRepository.create(body2); // Save id Water Meter
    // newReading.waterMeter = waterMeter; // Assign the water meter to the reading
    return await this.meterReadingRepository.save(newReading);
    // console.log(newReading);
    // return newReading;
  }

  // ========== FIND ALL ONE MONTH ===========
  // async findAllOneMonthMeterReadings(): Promise<MeterReading[]> {
  //   const mes = 4;
  //   const anio = 2024;
  //   const data = await this.meterReadingRepository
  //     .createQueryBuilder('meter_reading')
  //     // .where('meter_reading.userId = :userId', { userId: 123 })
  //     .andWhere('meter_reading.date <= :date', { date: new Date() })
  //     .getMany();
  //   //.andWhere('YEAR(meter_reading.date) = :date', { anio });
  //   console.log(data);
  //   return data;
  // }
  // ========== ENCONTRAR LECTURA DUPLICADA AL MES |================
  async findRepeatReadingsMonth(meterId: string, dateParam: Date) {
    const { startDate, endDate } = getFirstLastDayMonth(dateParam); // Return 2 dates start and end of month : 2024-05-20
    const data = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .where('meter_reading.date >= :startDate', {
        startDate: startDate,
      })
      .andWhere('meter_reading.date <= :endDate', {
        endDate: endDate,
      })
      .andWhere('meter_reading.water_meter_id = :id', { id: meterId })
      .getOne();
    return data;
  }

  // ========== ENCUENTRA TODAS LAS LECTURAS O LAS LECTURAS DE UN MES ENTERO  ==========
  async findAllMeterReadings(pagination: PaginationDto, date: FilterDateDto) {
    const { limit, offset } = pagination;
    const { startDate, endDate } = date;
    if (!startDate || !endDate) {
      const [readings, total] = await this.meterReadingRepository.findAndCount({
        relations: { waterMeter: true, invoice: true },
        skip: offset,
        take: limit,
      });
      return {
        limit,
        offset,
        total,
        readings,
      };
    }
    // const { startDate, endDate } = getFirstLastDayMonth(dateParam);
    // console.log({ startDate, endDate });
    const data = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .andWhere('meter_reading.date >= :startDate', {
        startDate: startDate,
      })
      .andWhere('meter_reading.date <= :endDate', {
        endDate: endDate,
      })
      .limit(limit)
      .offset(offset)
      .getManyAndCount();
    return { limit, offset, total: data[1], readings: data[0] };
  }

  // ========== ENCUENTRA EL ULTIMO MES LECTURADO DE UN USUARIO ==========
  async findTheLastMeterReading(meterId: string) {
    const lastMeterReading = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .where('meter_reading.waterMeterId = :meterId', {
        meterId: meterId,
      })
      .orderBy('meter_reading.date', 'DESC')
      .getOne();
    console.log(lastMeterReading);
    if (!lastMeterReading)
      throw new NotFoundException(`Medidor ${meterId} no registrado`);
    return lastMeterReading;
  }

  // ========== ENCUENTRA UNA LECTURA DE MEDIDOR POR SU ID  ==========
  async findOneById(_id: string) {
    // const meterReading = await this.meterReadingRepository.findOneBy({ _id });
    const meterReading = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .where('meter_reading._id >= :_id', { _id })
      .getOne();
    if (!meterReading) {
      throw new NotFoundException(`Lectura no encontrado`);
    }
    return meterReading;
    // return `This action returns a #${_idid} meterReading que`;
  }

  // ========== UPDATE A METER READING  ==========    NO FUNCIONAL
  async update(_id: string, body: UpdateMeterReadingDto) {
    // console.log(updateMeterReadingDto);
    const meterReading = await this.meterReadingRepository.findOneBy({ _id });
    if (!meterReading) {
      throw new NotFoundException(`Lectura del medidor no encontrado`);
    }
    // Verificar que el valor no debe ser inferior al anterior
    const beforeMonthAux = meterReading.beforeMonth;
    if (body.lastMonthValue && beforeMonthAux.meterValue > body.lastMonthValue)
      throw new NotAcceptableException(
        `El valor ${body.lastMonthValue} debe ser mayor al anterior ${beforeMonthAux.meterValue}`,
      );
    // const cubicMeters =
    //   body.lastMonthValue &&
    //   body.lastMonthValue - meterReading.beforeMonth.meterValue;
    // if (body?.balance) {
    //   meterReading['balance'] = this.calculateBalance(cubicMeters);
    // }
    // meterReading['cubicMeters'] = cubicMeters;
    const update = {
      date: body.date,
      lastMonth: {
        date: body.date,
        meterValue: body.lastMonthValue,
      },
      balance: body.balance || this.calculateBalance(100),
      description: body.description || meterReading.description,
    };
    Object.assign(meterReading, update);
    // console.log('Actualizado', meterReading);

    // return await this.meterReadingRepository.save(meterReading);
    return meterReading;
  }

  // ======== DELETE A METER READING =======
  remove(id: number) {
    return `This action removes a #${id} meterReading`;
  }

  calculateBalance(cubicMeters: number) {
    // El saldo debe ser mayor que cero 0
    // if (cubicMeters === null || cubicMeters < 0) {
    //   return {
    //     message:
    //       'Debe enviar un número positivo en la URL, por ejemplo, ?cubic=12',
    //   };
    // }
    if (cubicMeters <= 6) return 20;
    if (cubicMeters > 6 && cubicMeters <= 10) return 20 + 6 * (cubicMeters - 6);
    if (cubicMeters > 10 && cubicMeters < 20)
      return 20 + 24 + 14 * (cubicMeters - 10);
    if (cubicMeters >= 20 && cubicMeters < 25) return 184;
    if (cubicMeters >= 25 && cubicMeters < 30) return 254;
    if (cubicMeters >= 30) return 324;
    return 250; // Esto no deberia ser asi | Es para que no devuelva undefined
  }

  // ========== ENCUENTRA LAS LECTURAS POR SU ID  ==========
  async findMeterReadingById(readingId: string) {
    const data = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .where('meter_reading._id = :readingId', {
        readingId,
      })
      .getOne();
    if (!data) {
      throw new NotFoundException(`Lectura con id: ${readingId} no encontrado`);
    }
    return data;
  }

  // ========== GUARDA UNA INSTANCIA DE LA LECTUTA DEL MEDIDOR  ==========
  async saveMeterReading(meterReading) {
    return await this.meterReadingRepository.save(meterReading);
  }

  // ========== ENCUENTRA TODAS LAS LECTURAS DE UN MES  ==========
  async findMeterReadingsInnerJoinWaterInvoice(dateParam?: Date) {
    // console.log(dateParam);
    if (!dateParam) {
      const data = await this.meterReadingRepository
        .createQueryBuilder('meter_reading')
        .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
        .leftJoinAndSelect('meter_reading.invoice', 'invoice')
        .getMany();
      return data;
    }
    const { startDate, endDate } = getFirstLastDayMonth(dateParam);
    const data = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .where('meter_reading.date >= :startDate', {
        startDate: startDate,
      })
      .andWhere('meter_reading.date <= :endDate', {
        endDate: endDate,
      })
      .getMany();
    return data;
  }

  // ========== ENCUENTRA TODAS LAS LECTURAS DE UN USUARIO  ==========
  async findMeterReadingsInnerJoinWaterInvoiceByCI(
    ci: number,
    order: OrderQueryDTO,
    pagination: PaginationDto,
  ) {
    const { limit, offset } = pagination;
    console.log(pagination);
    // let order;
    // if (orderBy?.toUpperCase() === 'ASC') order = Order.ASC;
    // if (orderBy?.toUpperCase() === 'DESC') order = Order.DESC;
    console.log(order);
    const data = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .where('waterMeter.ci = :ci', { ci })
      .orderBy('meter_reading.date', order.order)
      .limit(limit)
      .offset(offset)
      .getMany();
    return data;
  }
  // ========== ENCUENTRA TODAS LAS LECTURAS DE UN MES EN ESTADO PAGADO ==========
}
