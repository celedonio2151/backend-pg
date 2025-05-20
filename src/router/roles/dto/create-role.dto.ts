// create-role.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre del rol. Ej: ADMIN, COCINERO, MESERO...',
    example: 'ADMIN',
  })
  @IsString()
  @MaxLength(50)
  @Transform(({ value }): string => value.toUpperCase())
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional del rol',
    example: 'Rol con acceso completo al sistema',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado del rol. true = activo, false = inactivo',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
