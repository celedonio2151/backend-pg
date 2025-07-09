import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPayload } from 'src/router/auth/interface/payload.interface';
// import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'jwtConstants.secret!',
    });
  }

  async validate(payload: AuthPayload) {
    // console.log('🚀 ~ JwtStrategy ~ validate ~ payload:', payload);
    return payload;
    // return {
    //   _id: payload._id,
    //   name: payload.name,
    //   email: payload.email,
    //   roles: payload.roles,
    // };
  }
}
