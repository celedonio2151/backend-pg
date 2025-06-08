import { Injectable } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import { BufferOptions, TDocumentDefinitions } from 'pdfmake/interfaces';

const fonts = {
  Roboto: {
    normal: 'src/fonts/static/Roboto-Regular.ttf',
    bold: 'src/fonts/static/Roboto-Medium.ttf',
    italics: 'src/fonts/static/Roboto-Italic.ttf',
    bolditalics: 'src/fonts/static/Roboto-MediumItalic.ttf',
  },
};

@Injectable()
export class PrinterService {
  private printer = new PdfPrinter(fonts);
  private options: BufferOptions = {
    bufferPages: true,
    fontLayoutCache: true,
  };

  createPDF(docDefinition: TDocumentDefinitions) {
    return this.printer.createPdfKitDocument(docDefinition, this.options);
  }
}
