import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/router/auth/auth.service';
// import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string) {
    // Verifica email y password en el metodo de AuthService
    const user = await this.authService.loginAdmin({
      email,
      password,
    });
    if (!user) throw new UnauthorizedException(`Invalid credentials`);
    return user;
  }
}
