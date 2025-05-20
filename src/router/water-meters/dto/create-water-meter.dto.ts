import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaterMeterDto {
  @ApiProperty({
    description: 'Cédula de identidad del usuario',
    example: 12345678,
    minimum: 100000,
    maximum: 999999999999,
  })
  // @Type(() => Number)
  @IsNumber()
  @Min(100000, {
    message: 'La cédula de identidad debe tener al menos 6 dígitos',
  })
  @Max(999999999999, {
    message: 'La cédula de identidad no puede tener más de 12 dígitos',
  })
  @IsNotEmpty()
  readonly ci: number;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 4,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  readonly name: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    minLength: 4,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3, { message: 'El apellido debe tener al menos 3 caracteres' })
  @MaxLength(100, {
    message: 'El apellido no puede tener más de 100 caracteres',
  })
  readonly surname: string;

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
    description: 'Estado del medidor de agua (activo o inactivo)',
    example: true || false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  readonly status?: boolean;
}
