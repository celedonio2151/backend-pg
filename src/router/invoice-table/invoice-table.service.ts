import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoicesService } from '../invoices/invoices.service';
import { WaterMetersService } from '../water-meters/water-meters.service';
import { CreateInvoiceTableDto } from './dto/create-invoice-table.dto';
import { UpdateInvoiceTableDto } from './dto/update-invoice-table.dto';
import { InvoiceTable } from './entities/invoice-table.entity';

@Injectable()
export class InvoiceTableService {
  constructor(
    @InjectRepository(InvoiceTable)
    private readonly invoiceTableRepository: Repository<InvoiceTable>,
    private readonly invoiceService: InvoicesService,
    private readonly waterMeterService: WaterMetersService,
  ) {}

  // Para crear las facturas deben pertenecer a un solo medidor de agua
  async create(body: CreateInvoiceTableDto) {
    const invoices: Invoice[] = [];
    const waterMeter = await this.waterMeterService.findOneById(
      body.waterMeterId,
    );
    for (const invoice_id of body.invoiceIds) {
      const invoice = await this.invoiceService.findOne(invoice_id);
      if (invoice.meterReading.waterMeter._id === waterMeter._id)
        invoices.push(invoice);
      else
        throw new NotAcceptableException(
          `El registro de factura ${invoice_id} no pertenece al medidor de agua`,
        );
      const invoiceTable = new InvoiceTable();
      invoiceTable.invoices = invoices;
      await this.invoiceTableRepository.save(invoiceTable);
    }
    return invoices;
  }

  async findAll() {
    return await this.invoiceTableRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} invoiceTable`;
  }

  update(id: number, body: UpdateInvoiceTableDto) {
    return `This action updates a #${id} invoiceTable ${body}`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoiceTable`;
  }
}
