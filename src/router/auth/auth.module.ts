import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/router/user/user.module';
import { HashService } from 'src/router/auth/hashing/password.hash';
import { JWTService } from 'src/jwt/jwt.service';
import { PassportModule } from '@nestjs/passport';

import { CustomMiddleware } from 'src/middlewares/duplicate.middleware';
import { LocalStrategy } from 'src/router/auth/strategies/auth.local.strategy';
import googleOauthConfig from 'src/configs/google-oauth.config';
import { GoogleStrategy } from 'src/router/auth/strategies/google.strategy';
import { RolesModule } from 'src/router/roles/roles.module';
import { JwtStrategy } from 'src/router/auth/strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
    ConfigModule.forFeature(googleOauthConfig),
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    LocalStrategy,
    HashService,
    JWTService,
    JwtStrategy,
  ],
  exports: [JWTService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CustomMiddleware).forRoutes(AuthController);
  }
}
