import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

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
}
