import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Response } from 'express';
import { GenerateQRCodeBNBDTO } from './dto/generate-qr-bnb.dto';
import { ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'src/decorators/public.decorator';
import { ReceiveNotificationDTO } from 'src/router/invoices/dto/recieve-notification.dto';
import { FilterDateDto } from 'src/shared/dto/queries.dto';

@ApiTags('Facturas (Recibos de agua)')
@Controller('invoice')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}
  // ========== FIND AND GENERATE A INVOICE  ==========
  // @Post(':readingId')
  @Get('/pdf/:readingId')
  // @IsPublic() // No deberia ggg
  async createPDF(
    @Param('readingId') readingId: string,
    @Query('mode') mode: string,
    @Res() res: Response,
  ): Promise<void> {
    const modePDF = mode || 'inline';
    const buffer = await this.invoicesService.generatePDFDocument(readingId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${modePDF}; filename=example.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  // ========== FIND AND GENERATE A INVOICE DOUBLE  ==========
  @Get('/pdf-double/:readingId')
  // @Public() // No deberia ggg
  async createPDFDouble(
    @Param('readingId') readingId: string,
    @Query('mode') mode: string,
    @Res() res: Response,
  ): Promise<void> {
    const modePDF = mode || 'inline';
    const buffer =
      await this.invoicesService.generatePDFDocumentDouble(readingId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${modePDF}; filename=example.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  // ========== CREATE INVOICES A MONTH ==========
  @Post('')
  async createInvoices(@Body() date: FilterDateDto) {
    return await this.invoicesService.createInvoices(date);
  }

  // ========== CREATE A INVOICE TEST ==========
  @Get('/pdf')
  async getPDF(
    @Body() body: any,
    @Query('mode') mode: string,
    @Res() res: Response,
  ): Promise<void> {
    const modePDF = mode || 'inline';
    const pdfDoc = await this.invoicesService.generatePDF({});

    res.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Recibo de Agua potable 2025';
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

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
    return this.invoicesService.getQRWithImageAsync(readingId);
    // return 'Hola que tal';
  }

  @Post('cancel/qr')
  cancelQRById(@Param('qrId') qrId: string) {
    return this.invoicesService.cancelQR(qrId);
  }
}
