import { PartialType } from '@nestjs/swagger';
import { CreateInvoiceTableDto } from './create-invoice-table.dto';

export class UpdateInvoiceTableDto extends PartialType(CreateInvoiceTableDto) {}
