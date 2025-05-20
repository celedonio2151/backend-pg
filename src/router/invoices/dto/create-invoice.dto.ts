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
  ci: number;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  fullname: string;

  @ApiProperty({
    description: 'Información del mes anterior (JSON como string)',
    example: '{"date": "2025-04-01T00:00:00.000Z", "meterValue": 120}',
  })
  @IsString()
  beforeMonth: string;

  @ApiProperty({
    description: 'Información del mes actual (JSON como string)',
    example: '{"date": "2025-05-01T00:00:00.000Z", "meterValue": 150}',
  })
  @IsString()
  lastMonth: string;

  @ApiProperty({
    description: 'Fecha de la factura',
    example: '2025-05-15T00:00:00.000Z',
  })
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'Número del medidor de agua',
    example: 987654321,
  })
  @IsNumber()
  meterNumber: number;

  @ApiProperty({
    description: 'Datos de la tabla de consumo (JSON como string)',
    example:
      '[{"concept":"Consumo","value":30},{"concept":"Cargo fijo","value":20}]',
  })
  @IsString()
  dataTable: string;

  @ApiProperty({
    description: 'Estado de pago de la factura',
    example: true,
    required: false,
  })
  @IsBoolean()
  paymentStatus?: boolean;
}
