import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JWTService } from 'src/jwt/jwt.service';
import { HashService } from 'src/router/auth/hashing/password.hash';
import { AuthPayload } from 'src/router/auth/interface/payload.interface';
import { RolesService } from 'src/router/roles/roles.service';
import { CreateUserDto } from 'src/router/user/dto/create-user.dto';
import { User } from 'src/router/user/entities/user.entity';
import { UserService } from 'src/router/user/user.service';
import {
  CreateAuthAdminDto,
  CreateGoogleUserDto,
  LoginAdminDto,
  LoginUserDto,
  RefreshTokenDto,
} from './dto/create-auth.dto';

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private hashService: HashService,
    private jwtService: JWTService,
    private readonly roleService: RolesService,
    private readonly configService: ConfigService,
  ) {}

  // ===============  CREATE NEW USER  =============================
  async create(body: CreateAuthAdminDto, filename: string) {
    const passwordHashed = await this.hashService.encrypt(body.password);
    const body2: CreateUserDto = {
      ...body,
      password: passwordHashed,
      profileImg: filename,
    };
    // console.log('🚀 ~ AuthService ~ bpdy:', body2);
    const newUser = await this.userService.create(body2);
    const payload: AuthPayload = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      roles: newUser.roles.map((role) => role.name),
    };
    const myTokens = await this.getTokens(payload);
    await this.userService.updateRefreshToken(
      newUser._id,
      myTokens.refreshToken,
    );
    await this.userService.updateAccessToken(newUser._id, myTokens.accessToken);
    const { password, accessToken, refreshToken, ...user } = newUser;
    return {
      myTokens,
      user,
      message: 'User created successfully',
    };
  }

  // ===============  VALIDATE GOOGLE USER  =============================
  async validateGoogleUser(body: CreateGoogleUserDto) {
    const existingUser = await this.userService.findByEmailRaw(body.email);
    let user: User;
    if (existingUser) {
      user = existingUser;
    } else {
      const role = await this.roleService.findOneByName('USER'); // Buscar el rol por nombre
      const body2: CreateGoogleUserDto = {
        ...body,
        password: '',
        authProvider: 'GOOGLE',
        role_id: [role._id],
      };
      user = await this.userService.createWithGoogle(body2);
    }

    const payload = this.createPayload(user);
    const myTokens = await this.getTokens(payload);
    await this.userService.updateRefreshToken(user._id, myTokens.refreshToken);
    await this.userService.updateAccessToken(user._id, myTokens.accessToken);

    const { password, accessToken, refreshToken, ...userData } = user;

    return {
      myTokens,
      user: userData,
      message: existingUser
        ? 'User logged in successfully with Google'
        : 'User created successfully with Google',
    };
  }

  // ===============  LOGIN ADMIN  =============================
  async loginAdmin(loginUser: LoginAdminDto) {
    const user = await this.userService.findByEmailRaw(loginUser.email);
    if (!user) throw new UnauthorizedException(`Credenciales inválidos`);
    const passwordTrue = await this.hashService.compare(
      loginUser.password,
      user.password,
    );
    if (!passwordTrue)
      throw new UnauthorizedException(`Credenciales inválidos`);
    const payload = this.createPayload(user);
    const myTokens = await this.getTokens(payload);
    // Save tokens en the database
    await this.userService.updateRefreshToken(user._id, myTokens.refreshToken);
    await this.userService.updateAccessToken(user._id, myTokens.accessToken);
    const { password, refreshToken, accessToken, ...result } = user;
    result.profileImg =
      this.configService.get('HOST_ADMIN') + 'profileImgs/' + user.profileImg;
    return {
      myTokens,
      user: result,
      message: `Inicio sesión correctamente`,
    };
  }

  // ===============  LOGIN USER  =============================
  async loginUser(loginUser: LoginUserDto) {
    console.log('🚀 ~ AuthService ~ loginUser ~ loginUser:', loginUser);
    const user = await this.userService.authfindByCIRaw(loginUser.ci);
    console.log('🚀 ~ AuthService ~ loginUser ~ user:', user);
    if (!user) throw new UnauthorizedException(`Credenciales inválidos`);
    const payload: AuthPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    };
    const myTokens = await this.getTokens(payload);
    // Save tokens en the database
    await this.userService.updateRefreshToken(user._id, myTokens.refreshToken);
    await this.userService.updateAccessToken(user._id, myTokens.accessToken);
    const { password, codeVerification, refreshToken, accessToken, ...result } =
      user;
    result.profileImg =
      this.configService.get('HOST_ADMIN') + 'profileImgs/' + user.profileImg;
    console.log(user);
    return {
      myTokens,
      user: result,
      message: `Inicio sesión correctamente`,
    };
  }

  // ===============  LOGOUT USER  =============================
  async logoutUser(
    user: AuthPayload,
    accessToken: string,
    refreshToken: string,
  ) {
    const findUser = await this.userService.findOneByIdAndTokens(user._id, [
      accessToken,
      refreshToken,
    ]);
    findUser.accessToken = findUser.accessToken.filter(
      (tk) => tk != accessToken,
    );
    findUser.refreshToken = findUser.refreshToken.filter(
      (tk) => tk != refreshToken,
    );
    await this.userService.saveUser(findUser);
    return {
      message: `User successfully logged out`,
    };
  }

  // ===============  LOGOUT USER ALL DEVICES  =============================
  async logoutUserAllDevices(
    user: AuthPayload,
    accessToken: string,
    refreshToken: string,
  ) {
    const findUser = await this.userService.findOneByIdAndTokens(user._id, [
      accessToken,
      refreshToken,
    ]);
    findUser.accessToken = [];
    findUser.refreshToken = [];
    await this.userService.saveUser(findUser);
    return {
      message: `User successfully logged out all devices`,
    };
  }

  // ============== new access token and refresh token  ====================
  async refreshTokens(body: RefreshTokenDto): Promise<Tokens> {
    const decodePayload = await this.jwtService.verifyRefreshToken(
      body.refreshToken,
    );
    const user = await this.userService.findOneById(decodePayload._id);
    const findUser = await this.userService.findOneByIdAndTokens(
      decodePayload._id,
      [body.accessToken, body.refreshToken],
    );
    const payload: AuthPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    };
    const tokens = await this.getTokens(payload);
    // Save tokens in the database
    findUser.accessToken = findUser.accessToken.filter(
      (tk) => tk != body.accessToken,
    );
    findUser.refreshToken = findUser.refreshToken.filter(
      (tk) => tk != body.refreshToken,
    );
    findUser.accessToken.push(tokens.accessToken);
    findUser.refreshToken.push(tokens.refreshToken);
    await this.userService.saveUser(findUser);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // generate access and refresh tokens for the user
  private async getTokens(params: AuthPayload): Promise<Tokens> {
    const tokenPayload: AuthPayload = {
      _id: params._id,
      name: params.name,
      email: params.email,
      roles: params.roles,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(tokenPayload, {
        secret: this.configService.get('JWT_KEY'),
        expiresIn: this.configService.get('JWT_EXPIRATION_TIMEOUT'),
      }),
      this.jwtService.signAsync(tokenPayload, {
        secret: this.configService.get('JWT_KEY_REFRESH'),
        expiresIn: this.configService.get('JWT_EXPIRATION_TIMEOUT_REFRESH'),
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  private createPayload(user: User): AuthPayload {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    };
  }
}
