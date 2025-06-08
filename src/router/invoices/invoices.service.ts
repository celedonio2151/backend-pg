import { HttpService } from '@nestjs/axios';
import {
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
import { FilterDateDto } from 'src/shared/dto/queries.dto';
import { BankService } from '../bank/bank.service';
import { GenerateQrDto } from '../bank/dto/create-bank.dto';
import { GenerateQRCodeBNBDTO } from './dto/generate-qr-bnb.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    private meterReadingService: MeterReadingsService,
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
    if (!invoice) {
      throw new NotFoundException(`El recibo aun no fue generado o no existe`);
    }
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
    const meterReading =
      await this.meterReadingService.findMeterReadingById(readingId);
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .leftJoinAndSelect('meter_reading.waterMeter', 'waterMeter')
      .where('invoice.meterReading_id	 = :meterReadingId', {
        meterReadingId: meterReading._id,
      })
      .getOne();
    if (!invoice) {
      throw new NotFoundException(`El recibo aun no fue generado o no existe`);
    }
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
    return this.printerService.createPDF(invoiceBuilt(body));
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

  // ========== ENCUENTRA UN INVOICE POR SU ID  ==========
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
