import {
    Body,
  Controller,
    Delete,
  Get,
    Param,
  Patch,
    Post,
} from '@nestjs/common';
import { CreateInvoiceTableDto } from './dto/create-invoice-table.dto';
import { UpdateInvoiceTableDto } from './dto/update-invoice-table.dto';
import { InvoiceTableService } from './invoice-table.service';

@Controller('invoice-table')
export class InvoiceTableController {
  constructor(private readonly invoiceTableService: InvoiceTableService) {}

  @Post()
  create(@Body() createInvoiceTableDto: CreateInvoiceTableDto) {
    return this.invoiceTableService.create(createInvoiceTableDto);
  }

  @Get()
  findAll() {
    return this.invoiceTableService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceTableService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceTableDto: UpdateInvoiceTableDto,
  ) {
    return this.invoiceTableService.update(+id, updateInvoiceTableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceTableService.remove(+id);
  }
}
