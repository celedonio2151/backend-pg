import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBillingDto {
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 0,
    description: 'Cantidad mínima de metros cúbicos para esta tarifa',
  })
  min_cubic_meters: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 10,
    description: 'Cantidad máxima de metros cúbicos para esta tarifa',
    minimum: 0,
  })
  max_cubic_meters: number;
  
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 5,
    description: 'Tarifa base para este rango de consumo',
    minimum: 0,
  })
  base_rate: number;
  
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 1.25,
    description: 'Tarifa por metro cúbico adicional dentro del rango',
    minimum: 0,
  })
  rate: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Tarifa residencial baja',
    required: false,
    description: 'Descripción opcional de la tarifa',
  })
  description?: string;
}
