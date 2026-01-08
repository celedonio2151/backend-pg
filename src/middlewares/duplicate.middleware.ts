import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { UserService } from 'src/router/user/user.service'; // Asegúrate de tener un servicio que consulte tu base de datos

@Injectable()
export class CustomMiddleware implements NestMiddleware {
  // constructor(private readonly userService: UserService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Solo puede ser capturado body de tipo json
    // Logs de debug removidos para producción
    next();
  }
}
