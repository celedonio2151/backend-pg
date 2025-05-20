import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { UserService } from 'src/router/user/user.service'; // Asegúrate de tener un servicio que consulte tu base de datos

@Injectable()
export class CustomMiddleware implements NestMiddleware {
  // constructor(private readonly userService: UserService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Solo puede ser capturado body de tipo json
    console.log('🚀 ~ CustomMiddleware ~ use ~ req:', req.body);
    // console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    console.log('Request url:', req.url);

    // if (!email) {
    //   throw new BadRequestException('Email is required');
    // }

    // const isRegistered = await this.userService.authfindByEmail(email);

    // if (isRegistered) {
    //   throw new BadRequestException('Email is already registered');
    // }

    next();
  }
}
