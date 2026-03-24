import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNumber, IsDate, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { BnbQrStatus } from '../entities/bank.entity';

export class GenerateQrDto {
  currency: string; // "BOB"
  gloss: string; // Descripción
  amount: number;
  singleUse: boolean;
  expirationDate: string; // "YYYY-MM-DD"
  additionalData: string;
  destinationAccountId: string;
}

export class BnbQrPaymentDto {
  @ApiProperty({
    description: 'ID del QR generado por BNB.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  qr_id: string;

  @ApiProperty({
    description: 'Imagen QR en base64.',
    example:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
  })
  @IsString()
  qr_image: string;

  @ApiProperty({
    description: 'Monto del QR.',
    example: 100.5,
    type: 'number',
    format: 'float',
  })
  @IsNumber()
  @Min(0) // Asumiendo que el monto no puede ser negativo
  amount: number;

  @ApiProperty({
    description: 'Moneda (BOB o USD).',
    example: 'BOB',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Gloss/Descripción enviada a BNB.',
    example: 'Pago de factura #12345',
  })
  @IsString()
  gloss: string;

  @ApiProperty({
    description: 'Estado del QR.',
    enum: BnbQrStatus,
    example: BnbQrStatus.PENDING,
  })
  @IsEnum(BnbQrStatus)
  status: BnbQrStatus;

  @ApiProperty({
    description: 'Fecha de expiración del QR.',
    example: '2024-12-31T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  expires_at: Date;

  @ApiProperty({
    description: 'ID de transacción de BNB (cuando se paga).',
    example: 'TXN-ABC-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiProperty({
    description: 'Nombre del pagador (cuando se paga).',
    example: 'Juan Pérez',
    required: false,
  })
  @IsOptional()
  @IsString()
  payer_name?: string;

  @ApiProperty({
    description: 'Fecha de pago.',
    example: '2024-12-25T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  paid_at?: Date;

  @ApiProperty({
    description: 'ID de la factura asociada.',
    example: 'INV-XYZ-789',
  })
  @IsString()
  invoice_id: string;
}
