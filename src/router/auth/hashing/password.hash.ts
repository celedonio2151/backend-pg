import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashService {
  async encrypt(password: string): Promise<string> {
    try {
      return await argon2.hash(password);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        `Error al encriptar la contraseña`,
      );
    }
  }

  async compare(password: string, passwordHashed: string): Promise<boolean> {
    try {
      // password match
      if (await argon2.verify(passwordHashed, password)) {
        return true;
      } else {
        // password did not match
        return false;
      }
    } catch (err) {
      console.log(err);
      // internal failure
      throw new InternalServerErrorException('Error al comparar contraseñas');
    }
  }
}
