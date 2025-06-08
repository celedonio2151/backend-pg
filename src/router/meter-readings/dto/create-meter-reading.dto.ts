import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

class BeforeMonthDto {
  @ApiProperty({
    description: 'Fecha de la lectura anterior',
    example: '2025-04-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'Valor del medidor en la lectura anterior',
    example: 120,
  })
  @IsNumber()
  @Type(() => Number)
  value: number;
}

export class CreateMeterReadingDto {
  @ApiProperty({
    description: 'ID del medidor de agua asociado a la lectura',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  readonly water_meterId: string;

  @ApiProperty({
    description: 'Fecha de la lectura del medidor',
    example: '2025-05-15T00:00:00.000Z',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  readonly date: Date;

  @ApiProperty({
    description: 'Información del mes anterior (fecha y valor del medidor)',
    type: BeforeMonthDto,
    example: '{"date": "2025-04-15T00:00:00.000Z", "value": 120}',
  })
  // @IsObject()
  // @ValidateNested()
  @IsNotEmpty()
  @Type(() => BeforeMonthDto)
  @Transform(({ value }) => {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value;
    } catch (e) {
      return undefined;
    }
  })
  readonly beforeMonth: BeforeMonthDto;

  @ApiProperty({
    description: 'Valor del medidor del mes pasado',
    example: 150,
  })
  @IsNumber()
  @Type(() => Number)
  readonly lastMonthValue: number;

  @ApiProperty({
    description: 'Imagen del medidor (opcional)',
    example: 'https://example.com/meter-image.jpg',
    required: false,
  })
  @IsOptional()
  readonly meterImage?: string;

  @ApiProperty({
    description: 'Balance en metros cúbicos (opcional)',
    example: 30,
    required: false,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  readonly balance?: number;

  @ApiProperty({
    description: 'Descripción adicional de la lectura (opcional)',
    example: 'Lectura realizada manualmente debido a problemas técnicos.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  readonly description?: string;
}
