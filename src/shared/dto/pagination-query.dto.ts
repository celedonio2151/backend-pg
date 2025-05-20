import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Límite de resultados por página',
    example: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Número de página (offset de resultados)',
    example: 0,
    minimum: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  offset?: number;
}
