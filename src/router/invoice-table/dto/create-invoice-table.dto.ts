import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateInvoiceTableDto {
  @IsNotEmpty()
  @IsUUID('4')
  waterMeterId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  invoiceIds: string[];
}
