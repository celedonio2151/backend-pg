import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthPayload } from 'src/router/auth/interface/payload.interface';
import { UserService } from 'src/router/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_KEY')!,
      passReqToCallback: true, // 🔥 Permite acceder al request,
    });
  }

  async validate(req: Request, payload: AuthPayload) {
    const userExist = await this.userService.findOneByIdAndAccessToken(
      payload._id,
      req['accessToken'],
    );
    if (!userExist) throw new UnauthorizedException('Invalid token or expired');
    return payload;
  }
}
