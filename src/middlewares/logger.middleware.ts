import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
  // use(req: FastifyRequest, res: FastifyReply, next: () => void) {
  use(req: Request, res: Response, next: NextFunction) {
    // console.log('Request...', req.body);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    console.log('Request url:', req.url);
    next();
  }
}
