import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  IsArray,
  IsNumber,
} from 'class-validator';

import { CreateUserDto } from 'src/router/user/dto/create-user.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, [
    'name',
    'surname',
    'phoneNumber',
    'birthDate',
    'profileImg',
    'password',
    'status',
    'role_id',
  ] as const),
) {
  @ApiProperty({
    description: 'Correo electrónico del usuario (único y opcional)',
    example: 'juan.perez@example.com',
    format: 'email',
    type: 'string',
    required: false,
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    minLength: 5,
    maxLength: 100,
  })
  @IsEmail({}, { message: 'Debe ser un formato de email válido' })
  @IsOptional()
  @IsNotEmpty({ message: 'El email no puede estar vacío si se proporciona' })
  email?: string;

  // Medidores de agua
  @ApiProperty({
    description: 'Lista de número de medidores de agua asociados al usuario',
    example: [123456789, 987654321],
    type: 'array',
    items: {
      type: 'number',
      minimum: 3,
      maximum: 999999999,
    },
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(3)
  @Max(999999999)
  @IsNotEmpty({
    message: 'La lista de medidores no puede estar vacía si se proporciona',
  })
  meter_numbers?: number[];
}
