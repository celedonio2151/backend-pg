import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { getFirstLastDayMonth } from 'src/helpers/calculateEveryone';
import { formatDate } from 'src/helpers/formatDate';
import { sequentialMonth } from 'src/helpers/sequentialMonth';
import { BillingService } from 'src/router/billing/billing.service';
import { WaterMetersService } from 'src/router/water-meters/water-meters.service';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { FilterDateDto, OrderQueryDTO } from 'src/shared/dto/queries.dto';
import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';
import { UpdateMeterReadingDto } from './dto/update-meter-reading.dto';
import { MeterReading } from './entities/meter-reading.entity';

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
    // console.log('🚀 ~ MeterReadingsService ~ body:', body);
    const waterMeter = await this.waterMeterService.findOneById(
      body.water_meterId,
    ); // Find the water meter
    // Verificar que la lectura sea secuencial por mes
    const lastReading = await this.findTheLastMeterReading(body.water_meterId);
    if (lastReading) {
      if (!sequentialMonth(lastReading.date, body.date))
        throw new NotAcceptableException(
          `Nueva lectura no es secuencial. La última lectura fue en el mes: ${formatDate(lastReading.date)}`,
        );
    }
    const existMonth = await this.findRepeatReadingsMonth(
      body.water_meterId,
      new Date(body.date),
    ); // Check if there is a reading for the same month
    if (existMonth)
      throw new NotAcceptableException(`Ya se lecturo para este mes`);
    // Verificar que el valor no debe ser inferior al anterior
    const beforeMonthAux = body.beforeMonth;
    if (beforeMonthAux.value > body.lastMonthValue)
      throw new NotAcceptableException(
        `El valor ${body.lastMonthValue} debe ser mayor al anterior ${beforeMonthAux.value}`,
      );
    const cubicMeters = body.lastMonthValue - body.beforeMonth.value;
    const balanceRaw = await this.billingService.calculateBalance(cubicMeters);
    const balance = typeof balanceRaw === 'number' ? balanceRaw : undefined;
    const body2 = {
      beforeMonth: beforeMonthAux,
      date: body.date,
      lastMonth: {
        date: body.date,
        meterValue: body.lastMonthValue,
      },
      cubicMeters: cubicMeters,
      balance: body.balance || balance,
      description: body.description || '',
      meterImage: file?.filename,
      waterMeter: waterMeter,
    };

    const newReading = this.meterReadingRepository.create(body2); // Save id Water Meter
    // newReading.waterMeter = waterMeter; // Assign the water meter to the reading
    // return await this.meterReadingRepository.save(newReading);
    console.log(newReading);
    return newReading;
  }

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

    const baseQuery = this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .where('meter_reading.date >= :startDate', { startDate })
      .andWhere('meter_reading.date <= :endDate', { endDate });

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
    // Count readings realizadas (con datos de lectura válidos)
    const readCount = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .where('meter_reading.date >= :startDate', { startDate })
      .andWhere('meter_reading.date <= :endDate', { endDate })
      .andWhere('meter_reading.lastMonth IS NOT NULL')
      .andWhere('meter_reading.lastMonth != :emptyJson', { emptyJson: '{}' })
      .getCount();

    // Count readings no realizadas (sin datos de lectura o con datos vacíos)
    const unreadCount = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .where('meter_reading.date >= :startDate', { startDate })
      .andWhere('meter_reading.date <= :endDate', { endDate })
      .andWhere(
        '(meter_reading.lastMonth IS NULL OR meter_reading.lastMonth = :emptyJson)',
        { emptyJson: '{}' },
      )
      .getCount();

    const data = await baseQuery
      .clone()
      .limit(limit)
      .offset(offset)
      .getManyAndCount();
    return {
      limit,
      offset,
      total: data[1],
      summary: {
        read: readCount,
        unread: unreadCount,
        total: readCount + unreadCount,
      },
      readings: data[0],
    };
  }

  // ========== ENCUENTRA EL ULTIMO MES LECTURADO DE UN USUARIO ==========
  async findTheLastMeterReading(meterId: string) {
    const lastMeterReading = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .where('meter_reading.water_meter_id = :meterId', {
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
      throw new NotFoundException(`La lectura no fue encontrada`);
    }
    return meterReading;
    // return `This action returns a #${_idid} meterReading que`;
  }

  // ========== ENCUENTRA UNA LECTURA DE MEDIDOR POR SU CI  ==========
  async findReadingsByCI(ci: number) {
    // const meterReading = await this.meterReadingRepository.findOneBy({ _id });
    const meterReading = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .where('waterMeter.ci >= :ci', { ci })
      .getOne();
    if (!meterReading) {
      throw new NotFoundException(`No se encontro lecturas`);
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
    if (body.lastMonthValue && beforeMonthAux.value > body.lastMonthValue)
      throw new NotAcceptableException(
        `El valor ${body.lastMonthValue} debe ser mayor al anterior ${beforeMonthAux.value}`,
      );
    // const cubicMeters =
    //   body.lastMonthValue &&
    //   body.lastMonthValue - meterReading.beforeMonth.value;
    // if (body?.balance) {
    //   meterReading['balance'] = this.calculateBalance(cubicMeters);
    // }
    // meterReading['cubicMeters'] = cubicMeters;
    const update = {
      date: body.date,
      lastMonth: {
        date: body.date,
        value: body.lastMonthValue,
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
  async saveMeterReading(meterReading: MeterReading) {
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
    const [data, total] = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .where('waterMeter.ci = :ci', { ci })
      .orderBy('meter_reading.date', order.order)
      .limit(limit)
      .offset(offset)
      .getManyAndCount();
    return {
      limit,
      offset,
      total,
      readings: data,
    };
  }

  // =====================================================================
  //                    SECCION DE REPORTES
  // =====================================================================

  // ========== SUMA TODAS LAS LECTURAS ==========
  async sumAllMeterReadings() {
    const resultRaw = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .select('SUM(meter_reading.cubicMeters)', 'sumTotal')
      .getRawOne<{ sumTotal: string | null }>();

    const sumTotal = Number(resultRaw?.sumTotal ?? 0);

    const [readings, totalReadings] = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .select('meter_reading.cubicMeters')
      .addSelect('meter_reading.date')
      .getManyAndCount();
    return { sumTotal, totalReadings, readings };
  }

  // ========== SUMA TODAS LAS LECTURAS DE UN USUARIO POR CI ==========
  async sumAllMeterReadingsByCI(ci: number) {
    const rawResult = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoin('meter_reading.waterMeter', 'waterMeter')
      .select('SUM(meter_reading.cubicMeters)', 'sumTotal')
      .where('waterMeter.ci = :ci', { ci })
      .getRawOne<{ sumTotal: string | null }>();

    const sumTotal = Number(rawResult?.sumTotal ?? 0);

    const [readings, totalReadings] = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .select('meter_reading.lastMonth')
      .addSelect('meter_reading.date')
      .addSelect('meter_reading.cubicMeters')
      .addSelect('waterMeter.ci')
      .addSelect('waterMeter.name')
      .addSelect('waterMeter.surname')
      .where('waterMeter.ci = :ci', { ci })
      .orderBy('meter_reading.date', 'ASC')
      .getManyAndCount();
    return { sumTotal, totalReadings, readings };
  }

  // ========== SUMA TODAS LAS LECTURAS POR MES ==========
  async sumAllMeterReadingsByMonth(date: FilterDateDto) {
    const { startDate, endDate } = date;
    if (!startDate || !endDate)
      throw new NotAcceptableException(`El rango de fechas son requeridas`);

    // Suma total
    const rawTotal = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoin('meter_reading.waterMeter', 'waterMeter')
      .select('SUM(meter_reading.cubicMeters)', 'sumTotal')
      .getRawOne<{ sumTotal: string | null }>();

    const sumTotal = Number(rawTotal?.sumTotal ?? 0);

    // Suma mensual
    const monthlyRaw = await this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoin('meter_reading.waterMeter', 'waterMeter')
      .select([
        `DATE_FORMAT(meter_reading.date, '%Y-%m') AS month`,
        `SUM(meter_reading.cubicMeters) AS totalCubicMeters`,
      ])
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; totalCubicMeters: string }>();

    // Convertir a números
    const monthly = monthlyRaw.map((row) => ({
      month: row.month,
      totalCubicMeters: Number(row.totalCubicMeters),
    }));

    return { cubics: sumTotal, readings: monthly };
  }

  // ================================================================
  //              MENSUAL REPORT
  // ================================================================
  async monthlyReport(dates: FilterDateDto) {
    const { startDate, endDate } = dates;

    // Validación de fechas
    if (!startDate || !endDate) {
      throw new NotAcceptableException(
        'Las fechas de inicio y fin son requeridas para el reporte mensual',
      );
    }

    // Asegurar que startDate esté al inicio del día y endDate al final del día
    // const startDateWithTime = new Date(startDate);
    // startDateWithTime.setUTCHours(0, 0, 0, 0);

    // const endDateWithTime = new Date(endDate);
    // endDateWithTime.setUTCHours(23, 59, 59, 999);

    const baseQuery = this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .where('meter_reading.date >= :startDate', { startDate })
      .andWhere('meter_reading.date <= :endDate', { endDate });

    // Obtener todos los totales en una sola consulta
    const summaryTotals = await baseQuery
      .clone()
      .select('SUM(meter_reading.cubicMeters)', 'totalCubicMeters')
      .addSelect('SUM(meter_reading.balance)', 'totalBalance')
      .addSelect(
        'SUM(CASE WHEN invoice.isPaid = true THEN meter_reading.balance ELSE 0 END)',
        'totalPaid',
      )
      .addSelect(
        'SUM(CASE WHEN invoice.isPaid = false THEN meter_reading.balance ELSE 0 END)',
        'totalPending',
      )
      .getRawOne<{
        totalCubicMeters: string;
        totalBalance: string;
        totalPaid: string;
        totalPending: string;
      }>();

    // Obtener reportes detallados
    const [reports, total] = await baseQuery
      .clone()
      .select([
        'meter_reading.cubicMeters',
        'meter_reading.balance',
        'meter_reading.date',
        'waterMeter.name',
        'waterMeter.surname',
        'waterMeter.ci',
        'waterMeter.meter_number',
        'invoice.status',
      ])
      .orderBy('meter_reading.date', 'ASC')
      .getManyAndCount();

    return {
      period: {
        startDate,
        endDate,
      },
      total,
      summary: {
        totalCubes: Number(summaryTotals?.totalCubicMeters) || 0,
        totalBilled: Number(summaryTotals?.totalBalance) || 0,
        totalPaid: Number(summaryTotals?.totalPaid) || 0,
        pendingAmount: Number(summaryTotals?.totalPending) || 0,
        // paidAmount: 0,
      },
      reports,
    };
  }

  // ================================================================
  //              ANNUAL REPORT
  // ================================================================
  async annualReport(dates: FilterDateDto) {
    const { startDate, endDate } = dates;
    // Validación y manejo de fechas undefined
    if (!startDate || !endDate) {
      throw new NotAcceptableException(
        'Las fechas de inicio y fin son requeridas para el reporte anual',
      );
    }

    // Asegurar que startDate esté al inicio del día y endDate al final del día
    // const startDateWithTime = new Date(startDate);
    // startDateWithTime.setUTCHours(0, 0, 0, 0);

    // const endDateWithTime = new Date(endDate);
    // endDateWithTime.setUTCHours(23, 59, 59, 999);

    const baseQuery = this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .where('meter_reading.date >= :startDate', {
        startDate,
      })
      .andWhere('meter_reading.date <= :endDate', { endDate });

    // Get monthly data
    const monthlyData = await baseQuery
      .clone()
      .select('EXTRACT(MONTH FROM meter_reading.date)', 'mes')
      .addSelect('SUM(meter_reading.cubicMeters)', 'consumo')
      .addSelect('SUM(meter_reading.balance)', 'facturado')
      .groupBy('EXTRACT(MONTH FROM meter_reading.date)')
      .orderBy('EXTRACT(MONTH FROM meter_reading.date)', 'ASC')
      .getRawMany<{ mes: number; consumo: number; facturado: number }>();

    // Get annual totals
    const annualTotals = await baseQuery
      .clone()
      .select('SUM(meter_reading.cubicMeters)', 'totalCubicMeters')
      .addSelect('SUM(invoice.amountDue)', 'totalBalance')
      .addSelect(
        'SUM(CASE WHEN invoice.isPaid = false THEN invoice.amountDue ELSE 0 END)',
        'pendingAmount',
      )
      .addSelect(
        'SUM(CASE WHEN invoice.isPaid = true THEN invoice.amountDue ELSE 0 END)',
        'paidAmount',
      )
      .getRawOne<{
        totalCubicMeters: number;
        totalBalance: number;
        pendingAmount: number;
        paidAmount: number;
      }>();

    // Mapear nombres de meses
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    // Crear array con todos los meses, incluso los que no tienen datos
    const allMonthsData = Array.from({ length: 12 }, (_, index) => {
      const monthData = monthlyData.find((m) => Number(m.mes) === index + 1);
      return {
        mes: monthNames[index],
        consumo: monthData ? Number(monthData.consumo) || 0 : 0,
        facturado: monthData ? Number(monthData.facturado) || 0 : 0,
      };
    });

    return {
      period: {
        startDate,
        endDate,
      },
      year: new Date(startDate).getFullYear(),
      summary: {
        totalMeters: allMonthsData.length,
        totalCubes: Number(annualTotals?.totalCubicMeters) || 0,
        totalBilled: Number(annualTotals?.totalBalance) || 0,
        pendingAmount: Number(annualTotals?.pendingAmount) || 0,
        paidAmount: Number(annualTotals?.paidAmount) || 0,
      },
      monthlyData: allMonthsData,
    };
  }

  // ================================================================
  //              ANNUAL REPORT BY METER
  // ================================================================
  async sumMeterReadingsByMeter(dates: FilterDateDto) {
    const { startDate, endDate } = dates;
    // Validación y manejo de fechas undefined
    if (!startDate || !endDate) {
      throw new NotAcceptableException(
        'Las fechas de inicio y fin son requeridas para el reporte anual',
      );
    }
    const baseQuery = this.meterReadingRepository
      .createQueryBuilder('meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .leftJoinAndSelect('meter_reading.invoice', 'invoice')
      .where('meter_reading.date >= :startDate', {
        startDate,
      })
      .andWhere('meter_reading.date <= :endDate', { endDate });

    // Get monthly data
    const [monthlyData, totalReadings] = await baseQuery
      .clone()
      .select('meter_reading.date')
      .addSelect('meter_reading.cubicMeters')
      .addSelect('meter_reading.balance')
      .addSelect('waterMeter.name')
      .addSelect('waterMeter.surname')
      .addSelect('waterMeter.ci')
      .addSelect('waterMeter.meter_number')
      .addSelect('invoice')
      .orderBy('meter_reading.date', 'ASC')
      .getManyAndCount();

    // Get annual totals
    const annualTotals = await baseQuery
      .clone()
      .select('SUM(meter_reading.cubicMeters)', 'totalCubicMeters')
      .addSelect('SUM(meter_reading.balance)', 'totalBalance')
      .getRawOne<{ totalCubicMeters: number; totalBalance: number }>();

    return {
      period: {
        startDate,
        endDate,
      },
      year: new Date(startDate).getFullYear(),
      summary: {
        totalReadings,
        totalCubes: Number(annualTotals?.totalCubicMeters) || 0,
        totalBilled: Number(annualTotals?.totalBalance) || 0,
      },
      monthlyData,
    };
  }
}
