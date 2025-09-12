import { HttpService } from '@nestjs/axios';
import {
    BadRequestException,
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { getFirstLastDayMonth } from 'src/helpers/calculateEveryone';
import { formatDate } from 'src/helpers/formatDate';
import { invoiceBuilt } from 'src/libs/invoice';
import { ReceiveNotificationDTO } from 'src/router/invoices/dto/recieve-notification.dto';
import {
    BodyGetTokenBNB,
    InvoicePDF,
    ReponseGetTokenBNB,
} from 'src/router/invoices/interfaces/interfacesBNB.ForQR';
import { MeterReadingsService } from 'src/router/meter-readings/meter-readings.service';
import { PrinterService } from 'src/router/printer/printer.service';
import { FilterDateDto, OrderQueryDTO } from 'src/shared/dto/queries.dto';
import { BankService } from '../bank/bank.service';
import { GenerateQrDto } from '../bank/dto/create-bank.dto';
import { WaterMetersService } from '../water-meters/water-meters.service';
import { GenerateQRCodeBNBDTO } from './dto/generate-qr-bnb.dto';
import { PayManyMonthsDto, UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    private meterReadingService: MeterReadingsService,
    private waterMeterService: WaterMetersService,
    private printerService: PrinterService,
    private readonly bankService: BankService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // ========== GENERA UN RECIBO DE PAGO  ==========
  async generatePDFDocument(readingId: string) {
    const reading =
      await this.meterReadingService.findMeterReadingById(readingId);
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .where('invoice.meter_reading_id	 = :meterReadingId', {
        meterReadingId: reading._id,
      })
      .getOne();
    console.log('🚀 ~ invoice:', invoice);
    if (!invoice)
      throw new NotFoundException(`El recibo aun no fue generado o no existe`);
    const body: InvoicePDF = {
      ci: invoice.meterReading.waterMeter.ci,
      // number: generateCodeNumber(Number(1)),
      name: invoice.meterReading.waterMeter.name,
      surname: invoice.meterReading.waterMeter.surname,
      meter_number: invoice.meterReading.waterMeter.meter_number,
      beforeMonth: {
        date: invoice.meterReading.beforeMonth.date,
        value: invoice.meterReading.beforeMonth.value,
      },
      lasthMonth: {
        date: invoice.meterReading.lastMonth.date,
        value: invoice.meterReading.lastMonth.value,
      },
      amountDue: invoice.amountDue,
      balance: invoice.meterReading.balance,
      date: invoice.meterReading.date,
      cubicMeters: invoice.meterReading.cubicMeters,
      isPaid: invoice.isPaid,
      status: invoice.status,
    };
    console.log('🚀body:', body);
    return this.printerService.createPDF(invoiceBuilt(body));
  }

  // ========== GENERA UN RECIBO DE PAGO  ==========
  async generatePDFDocumentDouble(readingId: string) {
    const reading =
      await this.meterReadingService.findMeterReadingById(readingId);
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .where('invoice.meter_reading_id	 = :meterReadingId', {
        meterReadingId: reading._id,
      })
      .getOne();
    if (!invoice)
      throw new NotFoundException(`El recibo aun no fue generado o no existe`);
    const body: InvoicePDF = {
      ci: invoice.meterReading.waterMeter.ci,
      // number: generateCodeNumber(Number(1)),
      name: invoice.meterReading.waterMeter.name,
      surname: invoice.meterReading.waterMeter.surname,
      meter_number: invoice.meterReading.waterMeter.meter_number,
      beforeMonth: {
        date: invoice.meterReading.beforeMonth.date,
        value: invoice.meterReading.beforeMonth.value,
      },
      lasthMonth: {
        date: invoice.meterReading.lastMonth.date,
        value: invoice.meterReading.lastMonth.value,
      },
      amountDue: invoice.amountDue,
      balance: invoice.meterReading.balance,
      date: invoice.meterReading.date,
      cubicMeters: invoice.meterReading.cubicMeters,
      isPaid: invoice.isPaid,
      status: invoice.status,
    };
    // console.log('🚀body:', body);
    return this.printerService.createPDFDouble(invoiceBuilt(body));
  }

  // ========== CREA AUTOMACAMENTE LOS RECIBOS CADA FECHA DEL DIA DEL MES  ==========
  async createInvoices(date: FilterDateDto) {
    const { startDate, endDate } = date;
    console.log('🚀 ~ InvoicesService ~ createInvoices ~ date:', date);
    if (!startDate || !endDate) {
      throw new NotAcceptableException(
        `No se encontro la fecha de inicio y fin del mes`,
      );
    }
    const readings = await this.meterReadingService.findAllMeterReadings(
      { limit: undefined, offset: undefined },
      date,
    );
    if (readings.readings.length <= 0)
      throw new NotFoundException(
        `No se encontraron lecturas del mes : ${formatDate(endDate, 'MMMM YYYY')}`,
      );
    for (const reading of readings.readings) {
      const checkInvoice = await this.invoicesRepository
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
        .where('meter_reading._id = :readingId', {
          readingId: reading._id,
        })
        .getOne();
      if (checkInvoice) {
        continue;
      }
      const invoice = new Invoice();
      invoice.amountDue = reading.balance; // Calcula el monto adeudado según tus necesidades
      invoice.isPaid = false;
      invoice.meterReading = reading;
      // Guarda el recibo de pago
      await this.invoicesRepository.save(invoice);
    }
    return {
      message: `Recibos restantes generados del mes : ${formatDate(endDate, 'MMMM YYYY')}`,
    };
  }

  async findAll() {
    return await this.invoicesRepository.find({
      relations: {
        meterReading: true,
      },
    });
  }

  // ========== ENCUENTRA UN INVOICE POR SU ID  ==========
  async findOne(invoiceId: string) {
    const invoice = await this.invoicesRepository.findOneBy({ _id: invoiceId });
    if (!invoice) {
      throw new NotFoundException(
        `Recibo de pago ${invoiceId} aun no fue generado o no existe`,
      );
    }
    return invoice;
  }

  // ========== ENCUENTRA UN INVOICE POR EL ID DE LECTURA  ==========
  async findOneByReadingId(readingId: string) {
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .where('meter_reading._id = :readingId', { readingId })
      .getOne();
    if (!invoice) {
      throw new NotFoundException(
        `Recibo ${readingId} no existe o aun no fue generado`,
      );
    }
    return invoice;
  }

  // ========== ENCUENTRA LOS USUARIOS QUE NO PAGARON SU DEUDA ==========
  async findUsersWithUnpaidInvoices(
    date?: FilterDateDto,
    ci?: number,
    order?: OrderQueryDTO,
  ) {
    const queryBase = this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'water_meter')
      .where('invoice.isPaid = :isPaid', { isPaid: false })
      .andWhere('invoice.deletedAt IS NULL')
      .andWhere('meter_reading.deletedAt IS NULL')
      .andWhere('water_meter.deletedAt IS NULL');

    // ✅ Filtro por CI (opcional)
    if (ci && ci > 0) {
      queryBase.andWhere('water_meter.ci = :ci', { ci });
    }

    // ✅ Filtros por fecha (opcionales)
    if (date?.startDate) {
      queryBase.andWhere('meter_reading.date >= :startDate', {
        startDate: date.startDate,
      });
    }

    if (date?.endDate) {
      queryBase.andWhere('meter_reading.date <= :endDate', {
        endDate: date.endDate,
      });
    }

    // ✅ Ordenar por fecha más reciente primero
    queryBase.orderBy('meter_reading.date', 'DESC');

    try {
      const [invoices, total] = await queryBase.getManyAndCount();

      // ✅ Información adicional útil
      const uniqueUsers = new Set(
        invoices.map((inv) => inv.meterReading?.waterMeter?.ci),
      );
      const dateRange =
        invoices.length > 0
          ? {
              earliest: invoices[invoices.length - 1]?.meterReading?.date,
              latest: invoices[0]?.meterReading?.date,
            }
          : null;

      return {
        total,
        uniqueUsersCount: uniqueUsers.size,
        filters: {
          ci: ci || null,
          startDate: date?.startDate || null,
          endDate: date?.endDate || null,
        },
        dateRange,
        invoices,
      };
    } catch (error) {
      console.error('Error finding unpaid invoices:', error);
      throw new Error('Error al buscar facturas no pagadas');
    }
  }

  // ========== ACTUALIZA EL ESTADO DE PAGO DE MUCHAS FACTURAS | RECIBOS DE UN MEDIDOR ==========
  async payManyMonths(body: PayManyMonthsDto) {
    const invoices: Invoice[] = [];
    const waterMeter = await this.waterMeterService.findOneById(body.meterId);
    for (const invoiceId of body.invoiceIds) {
      const invoice = await this.findOne(invoiceId);
      if (!invoice)
        throw new NotFoundException(
          `El recibo ${invoiceId} no existe o aun no fue generado`,
        );
      if (waterMeter._id !== invoice.meterReading.waterMeter._id)
        throw new BadRequestException('El medidor no coincide con el recibo');
      Object.assign(invoice, { isPaid: true });
      // await this.invoicesRepository.save(invoice);
      invoices.push(invoice);
    }
    return { total: invoices.length, invoices };
  }

  // ========== ACTUALIZA EL ESTADO DE PAGO DEL FACTURA | RECIBO  ==========
  async update(
    invoiceId: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .where('invoice._id = :invoiceId', {
        invoiceId,
      })
      .getOne();
    if (!invoice) {
      throw new NotFoundException(
        `El recibo ${invoiceId} no existe o aun no fue generado`,
      );
    }
    await this.meterReadingService.findOneById(invoice.meterReading._id);
    Object.assign(invoice, updateInvoiceDto);
    // console.log(invoice);
    await this.invoicesRepository.save(invoice);
    return invoice;
  }

  // ========== RECIEVE NOTIFICATION WHEN IS PAID BY QR  ==========
  async payByQRRecieveNotificaion(
    invoiceId: string,
    body: ReceiveNotificationDTO,
  ): Promise<Invoice> {
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .where('invoice._id = :invoiceId', {
        invoiceId,
      })
      .getOne();
    if (!invoice) {
      throw new NotFoundException(
        `El recibo ${invoiceId} no existe o aun no fue generado`,
      );
    }
    await this.meterReadingService.findOneById(invoice.meterReading._id);
    console.log('Body: ', invoiceId, body);
    console.log(invoice);
    // await this.invoicesRepository.save(invoice);
    return invoice;
  }

  // ================================================================
  //                  GENERA QR POR EL READING ID
  // ================================================================
  async getQRWithImageAsync2(readingId: string) {
    await this.meterReadingService.findOneById(readingId);
    const invoiceInnerReading = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .where('meter_reading._id = :readingId', { readingId })
      .getOne();
    if (!invoiceInnerReading)
      throw new NotFoundException(
        `No existe recibo para la lectura ${readingId} o aun no fue generado`,
      );
    if (invoiceInnerReading.isPaid)
      throw new NotAcceptableException(
        `El usuario ya cancelo su dueda del mes | ${formatDate(invoiceInnerReading.meterReading.date, 'MMMM YYYY')}`,
      );
    const { endDate } = getFirstLastDayMonth(new Date());
    const body: GenerateQrDto = {
      currency: 'BOB',
      gloss: `Prueba QR`,
      amount: invoiceInnerReading.amountDue,
      expirationDate: formatDate(endDate, 'YYYY-MM-DD HH:mm'),
      singleUse: true,
      additionalData: `_id=${invoiceInnerReading._id}`,
      destinationAccountId: '1',
    };
    const response = await this.bankService.generateQR(body);
    console.log(response);
    const resClient = {
      bankBNB: response,
      aditional: {
        name:
          invoiceInnerReading.meterReading.waterMeter.name +
          ' ' +
          invoiceInnerReading.meterReading.waterMeter.surname,
        month: invoiceInnerReading.meterReading.date,
        ...body,
      },
    };
    return resClient;
  }
  // ==================== GENEATE QR POR EL READING ID ================
  async getQRWithImageAsync(readingId: string): Promise<object> {
    await this.meterReadingService.findOneById(readingId);
    // Hace un inner join entre invoice, waterMeter y meter_reading
    const invoiceInnerReading = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .where('meter_reading._id = :readingId', { readingId })
      .getOne();
    // console.log('🚀 reading:', invoiceInnerReading);
    // Si no existe el recibo devolver un error
    if (!invoiceInnerReading)
      throw new NotFoundException(
        `No existe recibo para la lectura ${readingId} o aun no fue generado`,
      );
    if (invoiceInnerReading.isPaid)
      throw new NotAcceptableException(
        `El usuario ya cancelo su dueda del mes | ${formatDate(invoiceInnerReading.meterReading.date, 'MMMM YYYY')}`,
      );
    const { endDate } = getFirstLastDayMonth(new Date());
    const body: GenerateQRCodeBNBDTO = {
      currency: 'BOB',
      gloss: `Prueba QR`,
      amount: invoiceInnerReading.amountDue,
      expirationDate: formatDate(endDate, 'YYYY-MM-DD HH:mm'),
      singleUse: true,
      additionalData: `_id=${invoiceInnerReading._id}`,
      destinationAccountId: 1,
    };
    // console.log(body);
    const fistData = await this.getTokenBankBNB();
    // console.log('🚀 ~ InvoicesService ~ fistData:', fistData);
    if (fistData) {
      const data = await this.getQRBankBNB(fistData, body);
      // Utilizar el token para hacer otra solicitud y obtener la imagen de bits QR
      console.log(data);
      // console.log(JSON.parse(data));
      const resClient = {
        bankBNB: JSON.parse(data),
        aditional: {
          name:
            invoiceInnerReading.meterReading.waterMeter.name +
            ' ' +
            invoiceInnerReading.meterReading.waterMeter.surname,
          month: invoiceInnerReading.meterReading.date,
          ...body,
        },
      };
      return resClient;
    }
    throw new NotAcceptableException(`Fallo al obtener el codigo QR`);
  }

  // ========== OBTIENE EL TOKEN DE BNB PARA PETICIONES ==========
  async getTokenBankBNB() {
    const accountId = this.configService.get<string>('ACCOUNTID_BNB')!;
    const authorizationId = this.configService.get<string>(
      'AUTHORIZATIONID_BNB',
    )!;
    const ulrToken = this.configService.get<string>('URL_POST_TOKEN_BNB')!;
    const body: BodyGetTokenBNB = {
      accountId,
      authorizationId,
    };
    const { data } = await firstValueFrom(
      this.httpService.post<ReponseGetTokenBNB>(`${ulrToken}`, body).pipe(
        catchError((error: AxiosError) => {
          // this.logger.error(error.response.data);
          console.log('🚀 ~ InvoicesService ~ catchError :', error);
          throw new NotFoundException(`${error.response?.data}`);
        }),
      ),
    );
    return data;
  }

  // ========== OBTIENE EL QR GENERADO POR BNB ==========
  async getQRBankBNB(fistData: { success: boolean; message: string }, body) {
    const urlQr = this.configService.get<string>('URL_POST_QR_BNB');
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${urlQr}`, body, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${fistData.message}`,
          },
          responseType: 'arraybuffer',
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.log('🚀 ~ InvoicesService ~ catchError ~ error:', error);
            throw new NotFoundException(`${error.response?.data}`);
          }),
        ),
    );
    return data;
  }

  async cancelQR(qrId: string) {
    // {"qrId":59}
    return { message: `Codigo QR fue dado de baja` };
  }
}
