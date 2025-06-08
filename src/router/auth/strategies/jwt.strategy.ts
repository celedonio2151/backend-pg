import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from 'src/constants/JWTconstants';
import { AuthPayload } from 'src/router/auth/interface/payload.interface';
// import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    console.log('🚀 ~ JwtStrategy ~ constructor ~ jwtConstants:', jwtConstants);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "jwtConstants.secret!",
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
