import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Cédula de identidad del usuario',
    example: 12345678,
    minimum: 100000,
    maximum: 999999999999,
  })
  @IsNumber()
  ownerCi: number;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  ownerName: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Smith Sanchez',
  })
  @IsString()
  ownerSurname: string;

  @ApiProperty({
    description: 'Monto a pagar',
    example: 20,
  })
  @IsNumber()
  amountDue: number;

  @ApiProperty({
    description: 'Estado de pago de la factura',
    example: true,
    required: false,
  })
  @IsBoolean()
  isPaid?: boolean;

  @ApiProperty({
    description: 'Estado de la factura',
    example: true,
    required: false,
  })
  @IsBoolean()
  status?: boolean;
}
