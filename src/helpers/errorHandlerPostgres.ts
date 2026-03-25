import { ConflictException } from '@nestjs/common';

export function handlePostgresDuplicateError(error: any): never {
  console.log('Error de base de datos Postgres:', error);
  // En PostgreSQL, el código para "unique_violation" es 23505
  if (error?.code === '23505') {
    const detail = error.detail ?? '';

    // El error.detail en Postgres suele tener un formato como:
    // Key (phone_number)=(77777777) already exists.

    if (detail.includes('phone_number') || detail.includes('phoneNumber'))
      throw new ConflictException('El número de celular ya está registrado');

    if (detail.includes('email'))
      throw new ConflictException('El email ya está registrado');

    if (detail.includes('ci'))
      throw new ConflictException('La cédula ya está registrada');
    
    if (detail.includes('meter_number'))
        throw new ConflictException('El número de medidor ya está registrado');

    throw new ConflictException('Algún dato está siendo duplicado');
  }
  throw error;
}
