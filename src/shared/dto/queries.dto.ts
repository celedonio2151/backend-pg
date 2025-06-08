import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class StatusQueryDto {
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filtrar por estado (activo | inactivo)',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }): boolean => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  status?: boolean;
}

// ========================================================================
// Ordenamiento de resultados
// ========================================================================
export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class OrderQueryDTO {
  @IsOptional()
  @IsEnum(Order)
  order?: Order;
}

// ========================================================================
// Filtros por nombre
// ========================================================================
export class NameQueryDTO {
  @ApiPropertyOptional({
    type: String,
    description: 'Filtrar por nombre',
    example: 'name',
  })
  @IsOptional()
  @IsString()
  name?: string;
}

export class OrderFilterDto {
  @IsOptional()
  @IsIn(['hour', 'day', 'week', 'month', 'year'])
  range?: 'hour' | 'day' | 'week' | 'month' | 'year';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

// ========================================================================
// Filtrado por fecha
// ========================================================================
export class FilterDateDto {
  @ApiPropertyOptional({
    description: 'Fecha de fin en formato ISO, ej: "2025-04-29T16:52:29.220Z"',
    example: '2025-04-29T16:52:29.220Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const date = new Date(value);
    return date;
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de fin en formato ISO, ej: "2025-04-29T16:52:29.220Z"',
    example: '2025-04-29T16:52:29.220Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    if (!value) return undefined;
    const date = new Date(value);
    // Establece la hora al final del día (23:59:59.999)
    // Si el cliente envía solo una fecha sin hora, asegúrate que sea el final del día
    if (value?.length <= 10) {
      // "2025-04-16" (solo fecha)
      date.setUTCHours(23, 59, 59, 999);
    }
    return date;
  })
  endDate?: Date;
}

// =======================================================================
// Consulta para el modo de visualización del PDF : inline | attachment
// =======================================================================

enum ModePDF {
  INLINE = 'inline',
  ATTACHMENT = 'attachment',
}
export class ModePDFQueryDto {
  @ApiPropertyOptional({
    description: 'Modo de visualización del PDF',
    example: 'inline',
    enum: ModePDF,
    enumName: 'ModePDF',
    type: String,
    required: false,
    default: ModePDF.INLINE,
  })
  @IsOptional()
  @IsEnum(ModePDF)
  mode?: ModePDF;
}
