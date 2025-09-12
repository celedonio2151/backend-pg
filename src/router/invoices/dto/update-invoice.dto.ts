import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { CreateInvoiceDto } from './create-invoice.dto';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @ApiProperty({
    description: 'Indica si la factura ya fue pagada',
    example: true,
  })
  @IsBoolean()
  isPaid: boolean;
}

export class PayManyMonthsDto {
  @ApiProperty({
    description: 'ID del medidor al que pertenecen las facturas',
    example: 'b3b0e253-f2dd-4629-91f9-3fc19716cf04',
  })
  @IsUUID()
  @IsNotEmpty()
  meterId: string;

  @ApiProperty({
    description: 'Lista de IDs de facturas a pagar',
    type: [String],
    example: [
      'b3b0e253-f2dd-4629-91f9-3fc19716cf04',
      'f470a8c6-142b-4df8-9a75-98555dcefd17',
    ],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @ArrayMinSize(1)
  @IsUUID('all', { each: true }) // cada item del array debe ser UUID
  invoiceIds: string[];
}
