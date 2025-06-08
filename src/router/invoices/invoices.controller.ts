import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { generateNamePDF } from 'src/helpers/generateNamePDF';
import { ReceiveNotificationDTO } from 'src/router/invoices/dto/recieve-notification.dto';
import { FilterDateDto, ModePDFQueryDto } from 'src/shared/dto/queries.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('Facturas (Recibos de agua)')
@Controller('invoice')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // ========== CREATE INVOICES A MONTH ==========
  @Post('')
  async createInvoices(@Body() date: FilterDateDto) {
    return await this.invoicesService.createInvoices(date);
  }

  // ========== FIND BY ID AND GENERATE A INVOICE  ==========
  @Get('/pdf/:readingId')
  // @IsPublic() // No deberia ggg
  async createPDF(
    @Param('readingId') readingId: string,
    @Query('mode') mode: ModePDFQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const modePDF = mode.mode || 'inline';
    const pdfDoc = await this.invoicesService.generatePDFDocument(readingId);
    const filename = generateNamePDF();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${modePDF}; filename=${filename}.pdf`,
    });
    pdfDoc.info.Title = 'Recibo de Agua potable 2025';
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  // ========== FIND AND GENERATE A INVOICE DOUBLE  ==========
  @Get('/pdf-double/:readingId')
  // @Public() // No deberia ggg
  async createPDFDouble(
    @Param('readingId') readingId: string,
    @Query('mode') mode: ModePDFQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const modePDF = mode.mode || 'inline';
    const pdfDoc =
      await this.invoicesService.generatePDFDocumentDouble(readingId);
    res.setHeader(
      'Content-Disposition',
      `${modePDF}; filename=example-double.pdf`,
    );
    pdfDoc.info.Title = 'Recibo de Agua potable 2025';
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  // ========== CREATE A INVOICE TEST ==========
  // @Get('/pdf')
  // async getPDF(
  //   @Body() body: any,
  //   @Query('mode') mode: ModePDFQueryDto,
  //   @Res() res: Response,
  // ): Promise<void> {
  //   const modePDF = mode || 'inline';
  //   const pdfDoc = await this.invoicesService.generatePDF({});

  //   res.setHeader('Content-Type', 'application/pdf');
  //   pdfDoc.info.Title = 'Recibo de Agua potable 2025';
  //   pdfDoc.pipe(res);
  //   pdfDoc.end();
  // }

  // ========== LISTA ALL INVOICES RELATIONS WITH METER READING ==========
  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

  // ========== GET A INVOICE WITH READING ID ==========
  @Get('/reading-id/:readingId')
  findOne(@Param('readingId') readingId: string) {
    return this.invoicesService.findOneByReadingId(readingId);
  }

  // ========== PAID LOCAL MY INVOICE ==========
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  // ========== PAID LOCAL MY INVOICE ==========
  @Patch(':id/ReceiveNotification')
  payByQR(@Param('id') id: string, @Body() body: ReceiveNotificationDTO) {
    return this.invoicesService.payByQRRecieveNotificaion(id, body);
  }

  // ========== GENERATE CODE QR OF INVOICE -> METER READING ==========
  @Post('/qr/:readingId')
  generateQRBNB(@Param('readingId') readingId: string) {
    return this.invoicesService.getQRWithImageAsync2(readingId);
    // return 'Hola que tal';
  }

  @Post('cancel/qr')
  cancelQRById(@Param('qrId') qrId: string) {
    return this.invoicesService.cancelQR(qrId);
  }
}
