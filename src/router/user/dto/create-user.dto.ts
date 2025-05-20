import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @Type(() => Number)
  @IsInt()
  @Min(100000, { message: 'CI debe tener al menos 6 dígitos' })
  @Max(9999999999, { message: 'CI no puede tener más de 10 dígitos' })
  @ApiProperty({
    description: 'Cédula de identidad del usuario (única)',
    example: 75421222,
  })
  ci: number;

  @IsString()
  @Length(2, 50)
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  name: string;

  @IsString()
  @Length(2, 150)
  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez Rodríguez',
  })
  surname: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    description: 'Correo electrónico del usuario (único)',
    example: 'juan.perez@example.com',
  })
  email?: string;

  @IsString()
  @Length(6, 50)
  @IsStrongPassword()
  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'Secreta123',
  })
  password: string;

  // @IsOptional()
  @Type(() => Number)
  @Min(100000, { message: 'Celular debe tener al menos 6 dígitos' })
  @Max(999999999999, {
    message: 'Celular no puede tener más de 12 dígitos',
  })
  // @Matches(/^\d{8,}$/, {
  //   message: 'Número de celular inválido, mínimo 8 dígitos numéricos',
  // })
  @ApiProperty({
    description: 'Número de celular del usuario',
    example: '72511122',
  })
  phoneNumber: string;

  @Type(() => Date)
  @IsDateString()
  @IsOptional()
  @ApiProperty({
    description: 'Fecha de nacimiento del usuario (formato ISO)',
    example: '1990-05-15',
    type: 'string',
    format: 'date',
  })
  birthDate?: Date;

  @Type(() => Number)
  @IsInt()
  @Min(9999, {
    message: 'Número de medidor de agua debe tener al menos 4 dígitos',
  })
  @Max(9999999999, {
    message: 'Número de medidor de agua no puede tener más de 10 dígitos',
  })
  @IsOptional()
  @ApiProperty({
    description: 'Numero de medidor de agua del usuario (opcional)',
    example: '5875412',
    type: 'string',
    required: false,
  })
  readonly meter_number?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Ruta o nombre del archivo de imagen de perfil',
    example: 'defaultUser.png',
    required: false,
  })
  profileImg?: string;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Estado del usuario (activo o inactivo) true | false',
    example: true,
    required: false,
  })
  status?: boolean;

  @Type(() => Array)
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @IsUUID('all', { each: true })
  @ArrayMinSize(1)
  @ApiProperty({
    description: 'Lista de IDs de roles asignados al usuario',
    example: ['f7e947e1-9c41-4f3b-9a11-1ddc45e5c1a1'],
    type: [String],
  })
  @Transform(({ value }): string[] => {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      return value;
    } catch (e) {
      console.log('Error en DTO', e);
      return [];
    }
  })
  role_id: string[];
}
