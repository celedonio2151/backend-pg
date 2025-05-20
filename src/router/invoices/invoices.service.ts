import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

import { Invoice } from './entities/invoice.entity';
import { MeterReadingsService } from 'src/router/meter-readings/meter-readings.service';
import { formatDate } from 'src/helpers/formatDate';
import { GenerateQRCodeBNBDTO } from './dto/generate-qr-bnb.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  generateCodeNumber,
  getFirstLastDayMonth,
} from 'src/helpers/calculateEveryone';
import { ReceiveNotificationDTO } from 'src/router/invoices/dto/recieve-notification.dto';
import {
  BodyGetTokenBNB,
  ReponseGetTokenBNB,
} from 'src/router/invoices/interfaces/interfacesBNB.ForQR';
import { ConfigService } from '@nestjs/config';
import { FilterDateDto } from 'src/shared/dto/queries.dto';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PrinterService } from 'src/router/printer/printer.service';
import { invoiceBuilt } from 'src/libs/invoice';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    private meterReadingService: MeterReadingsService,
    private printerService: PrinterService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Create a invoice TEST
  // async generatePDF(body: any): Promise<PDFKit.PDFDocument> {
  //   const document: TDocumentDefinitions = {
  //     content: ['Hola mundo', 'Celedonio Perka casillas'],
  //   };
  //   return await this.printerService.createPDF(document);
  // }

  async generatePDF(invoice: any): Promise<PDFKit.PDFDocument> {
    // const logoPath = 'src/assets/logoAgua.png';

    // Carga el logo como base64
    // const logoPath = path.join(__dirname, '../../assets/logo.png');
    // const logoBase64 = fs.readFileSync(logoPath).toString('base64');

    // Retorna el buffer del PDF usando tu PrinterService
    return await this.printerService.createPDF(invoiceBuilt({}));
  }

  // ========== GENERA UN RECIBO DE PAGO  ==========
  async generatePDFDocument(readingId: string) {
    const meterReading =
      await this.meterReadingService.findMeterReadingById(readingId);
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .where('invoice.meter_reading_id	 = :meterReadingId', {
        meterReadingId: meterReading._id,
      })
      .getOne();
    if (!invoice) {
      throw new NotFoundException(`El recibo aun no fue generado o no existe`);
    }
    const body = {
      number: generateCodeNumber(Number(invoice._id)),
      ci: meterReading.waterMeter.ci,
      name: meterReading.waterMeter.name,
      surname: meterReading.waterMeter.surname,
      meterNumber: meterReading.waterMeter.meter_number,
      beforeMonth: meterReading.beforeMonth,
      lastMonth: meterReading.lastMonth,
      readings: [
        {
          month: formatDate(meterReading.lastMonth.date, 'MMMM').toUpperCase(),
          value: meterReading.cubicMeters,
          balance: meterReading.balance,
        },
      ],
    };
    // console.log('🚀body:', body);
    const pdfBuffer: Buffer = await new Promise<Buffer>((resolve) =>
      // buildPDFKit(body, resolve),
      console.log('PDF generator'),
    );
    return pdfBuffer;
  }

  // ========== GENERA UN RECIBO DE PAGO  ==========
  async generatePDFDocumentDouble(readingId: string) {
    const meterReading =
      await this.meterReadingService.findMeterReadingById(readingId);
    const invoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.meterReading', 'meter_reading')
      .where('invoice.meterReading_id	 = :meterReadingId', {
        meterReadingId: meterReading._id,
      })
      .getOne();
    if (!invoice) {
      throw new NotFoundException(`El recibo aun no fue generado o no existe`);
    }
    const body = {
      number: generateCodeNumber(Number(invoice._id)),
      ci: meterReading.waterMeter.ci,
      name: meterReading.waterMeter.name,
      surname: meterReading.waterMeter.surname,
      meterNumber: meterReading.waterMeter.meter_number,
      beforeMonth: meterReading.beforeMonth,
      lastMonth: meterReading.lastMonth,
      readings: [
        {
          month: formatDate(meterReading.lastMonth.date, 'MMMM').toUpperCase(),
          value: meterReading.cubicMeters,
          balance: meterReading.balance,
        },
      ],
    };
    // console.log('🚀body:', body);
    const pdfBuffer: Buffer = await new Promise<Buffer>((resolve) =>
      // buildPDFKitDouble(body, resolve),
      console.log('PDF generator double'),
    );
    return pdfBuffer;
  }

  // ========== CREA AUTOMACAMENTE LOS RECIBOS CADA FECHA DEL DIA DEL MES  ==========
  async createInvoices(date: FilterDateDto) {
    const { startDate, endDate } = date;
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
        `No se encontraron lecturas de mes : ${formatDate(endDate!, 'MMMM YYYY')}`,
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
      message: `Recibos restantes generados del mes : ${formatDate(endDate!, 'MMMM YYYY')}`,
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
      throw new NotFoundException(`Recibo ${readingId} no fue encontrado`);
    }
    return invoice;
  }

  // ========== ACTUALIZA EL ESTADO DE PAGO DEL FACTURA RECIBO  ==========
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
    const payStatus = true;
    await this.meterReadingService.findOneById(invoice.meterReading._id);
    console.log('Body: ', invoiceId, body);
    console.log(invoice);
    // await this.invoicesRepository.save(invoice);
    return invoice;
  }

  // ==================== GENEATE QR POR EL READING ID ================
  async getQRWithImageAsync(readingId: string): Promise<object> {
    // Hacer una solicitud al servidor para obtener el token
    // Buscar la lectura del medidor
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
    if (!invoiceInnerReading) {
      throw new NotFoundException(
        `No existe recibo para la lectura ${readingId} o aun no fue generado`,
      );
    }
    if (invoiceInnerReading.isPaid) {
      throw new NotAcceptableException(
        `El usuario ya cancelo su dueda del mes | ${formatDate(invoiceInnerReading.meterReading.date, 'MMMM YYYY')}`,
      );
    }
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
    const accountId = this.configService.get('ACCOUNTID_BNB');
    const authorizationId = this.configService.get('AUTHORIZATIONID_BNB');
    const ulrToken = this.configService.get('URL_POST_TOKEN_BNB');
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
    const urlQr = this.configService.get('URL_POST_QR_BNB');
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
