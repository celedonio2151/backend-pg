import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

// import { jwtConstants } from 'src/constants/constantsJWT';
import { AuthPayload } from 'src/router/auth/interface/payload.interface';

@Injectable()
export class JWTService {
  private readonly logger = new Logger(JWTService.name);
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Metodo: Genera token
  async signAsync(payload: AuthPayload, options?: JwtSignOptions) {
    return await this.jwtService.signAsync(payload, {
      secret: options?.secret || this.configService.get('JWT_KEY'),
      expiresIn:
        options?.expiresIn || this.configService.get('JWT_EXPIRATION_TIMEOUT'),
    });
  }

  // Método: Verificar access token
  async verifyAsync(token: string): Promise<AuthPayload> {
    const payload: AuthPayload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_KEY'),
    });
    return payload;
  }

  // Método: Verificar refresh token
  async verifyRefreshToken(token: string): Promise<AuthPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_KEY_REFRESH'),
      });
    } catch (error) {
      this.logger.error('Error verifying refresh token', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Método adicional: Decodificar token sin verificar (útil para debugging)
  decode(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      this.logger.error('Error decoding JWT token', error);
      return null;
    }
  }
  // Método para verificar si el token está próximo a expirar
  isTokenExpiringSoon(token: string, minutesThreshold = 2): boolean {
    try {
      const decoded = this.decode(token);
      if (!decoded || !decoded.exp) return true;

      const expirationTime = decoded.exp * 1000; // Convertir a milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      const thresholdTime = minutesThreshold * 60 * 1000;

      return timeUntilExpiration < thresholdTime;
    } catch {
      return true;
    }
  }
}
