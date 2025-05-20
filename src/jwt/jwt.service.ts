import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

// import { jwtConstants } from 'src/constants/constantsJWT';
import { AuthPayload } from 'src/router/auth/interface/payload.interface';

@Injectable()
export class JWTService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async signAsync(payload: AuthPayload, options?: JwtSignOptions) {
    return await this.jwtService.signAsync(payload, {
      secret: options?.secret || this.configService.get('JWT_KEY'),
      expiresIn:
        options?.expiresIn || this.configService.get('JWT_EXPIRATION_TIMEOUT'),
    });
  }

  async verifyAsync(token: string): Promise<AuthPayload> {
    const payload: AuthPayload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('jwt.accessTokenSecret'),
    });
    return payload;
  }
}
