import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaterMeterDto {
  @ApiProperty({
    description: 'Número del medidor de agua',
    example: 123456789,
    minimum: 999,
    maximum: 9999999999,
  })
  @IsNumber()
  @IsInt()
  @Min(999, {
    message: 'El número del medidor de agua debe tener al menos 3 dígitos',
  })
  @Max(9999999999, {
    message: 'El número del medidor de agua no puede tener más de 10 dígitos',
  })
  @IsNotEmpty()
  @Type(() => Number)
  readonly meter_number: number;

  @ApiProperty({
    description: 'ID del usuario asociado al medidor de agua',
    example: 1,
    required: true,
  })
  @IsString()
  @IsUUID()
  @Type(() => String)
  readonly user_id: string;

  @ApiProperty({
    description: 'Estado del medidor de agua (activo o inactivo)',
    example: true || false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  readonly status?: boolean;
}
