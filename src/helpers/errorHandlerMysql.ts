import { ConflictException } from '@nestjs/common';

export function handleMysqlDuplicateError(error: any): never {
  console.log('Error al registrar usuario', error);
  if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
    const key = error.sqlMessage ?? '';

    if (key.includes('IDX_USER_PHONE_UNIQUE'))
      throw new ConflictException('El número de celular ya está registrado');

    if (key.includes('IDX_USER_EMAIL_UNIQUE'))
      throw new ConflictException('El email ya está registrado');

    if (key.includes('IDX_USER_CI_UNIQUE'))
      throw new ConflictException('La cédula ya está registrada');

    throw new ConflictException('Algun dato esta siendo duplicado');
  }
  throw error;
}
