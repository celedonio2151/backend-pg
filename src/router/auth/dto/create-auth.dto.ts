import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  // IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

import { CreateUserDto } from 'src/router/user/dto/create-user.dto';

export class CreateAuthAdminDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  codeAdmin: string;
}

// SIGNUP ADMIN GOOGLE DTO
export class CreateGoogleUserDto extends PickType(CreateUserDto, [
  'name',
  'surname',
  'password',
  'profileImg',
  'role_id',
] as const) {
  @ApiProperty({
    description: 'Correo electrónico del usuario (único)',
    example: 'juan.perez@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsBoolean()
  @ApiPropertyOptional({
    example: true,
    description: 'Verificacion de email es requerido',
  })
  @Transform(({ value }) => (value ? true : false))
  emailVerified: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Google',
    description: 'El proveedor de autenticacion es requerido',
  })
  @IsEnum(['GOOGLE', 'LOCAL'])
  @Transform(({ value }) => (value ? 'GOOGLE' : 'LOCAL'))
  authProvider: 'GOOGLE' | 'LOCAL';
}

// LOGIN ADMIN LOCAL DTO
export class LoginAdminDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email es requerido',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Password123++',
    description: 'La contraseña es requerida',
  })
  @IsStrongPassword()
  password: string;
}

// LOGIN USER DTO
export class LoginUserDto {
  @ApiProperty({
    example: '75481122',
    description: 'CI es requerido',
  })
  @IsNumber()
  @IsNotEmpty()
  ci: number;
}

// LOGOUT USER
export class LogoutUserDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI4ZTUyOGNkMy02OGY5LTQ2OTAtOGNjMC03ZTQ3ZGVkZjFhZDIiLCJuYW1lIjoiUnVieSIsImVtYWlsIjoicnVieUBnbWFpbC5jb20iLCJyb2xlcyI6WyJBRE1JTiIsIlVTRVIiXSwiaWF0IjoxNzQ0ODQ3ODY0LCJleHAiOjE3NDQ4NDg0NjR9.6GGY4zcf1giz_hg3Z1BCvdIn9g6DONXWmbafaVWF0uo',
    description: 'El refreshToken es requerido',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

// REFRESH TOKEN DTO
export class RefreshTokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI4ZTUyOGNkMy02OGY5LTQ2OTAtOGNjMC03ZTQ3ZGVkZjFhZDIiLCJuYW1lIjoiUnVieSIsImVtYWlsIjoicnVieUBnbWFpbC5jb20iLCJyb2xlcyI6WyJBRE1JTiIsIlVTRVIiXSwiaWF0IjoxNzQ0ODQ3ODY0LCJleHAiOjE3NDQ4NDg0NjR9.6GGY4zcf1giz_hg3Z1BCvdIn9g6DONXWmbafaVWF0uo',
    description: 'El accessToken expirado es requerido',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI4ZTUyOGNkMy02OGY5LTQ2OTAtOGNjMC03ZTQ3ZGVkZjFhZDIiLCJuYW1lIjoiUnVieSIsImVtYWlsIjoicnVieUBnbWFpbC5jb20iLCJyb2xlcyI6WyJBRE1JTiIsIlVTRVIiXSwiaWF0IjoxNzQ0ODQ3ODY0LCJleHAiOjE3NDQ4NDg0NjR9.6GGY4zcf1giz_hg3Z1BCvdIn9g6DONXWmbafaVWF0uo',
    description: 'El refreshToken es requerido',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
