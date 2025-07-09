import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBoardDirectorDto {
  @ApiProperty({
    description: 'ID del usuario que será miembro de la mesa directiva',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Fecha de inicio del cargo en la mesa directiva',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de finalización del cargo en la mesa directiva',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    description: 'Cargo o posición en la mesa directiva',
    example: 'Presidente',
    enum: ['Presidente', 'Vicepresidente', 'Secretario', 'Tesorero', 'Vocal'],
  })
  @IsString()
  positionRole: string;

  @ApiProperty({
    description:
      'Orden jerárquico (1: Presidente, 2: Vicepresidente, 3: Secretario, 4: Tesorero, 5: Vocal) etc.',
    minimum: 1,
    maximum: 10,
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  orden: number;

  @ApiProperty({
    description: 'Descripción adicional o notas sobre el cargo',
    example: 'Responsable de liderar las juntas mensuales',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
