import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';

import { IsPublic } from 'src/decorators/public.decorator';
import { GoogleAuthGuard } from 'src/guards/google-auth.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { deleteFile } from 'src/helpers/delete.file';
import {
  fileFilter,
  fileRename,
  profileImgFilePath,
} from 'src/helpers/file.filter';
import { UserService } from 'src/router/user/user.service';
import { AuthService } from './auth.service';
import {
  CreateAuthAdminDto,
  LoginAdminDto,
  LoginUserDto,
  LogoutUserDto,
  RefreshTokenDto,
} from './dto/create-auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // ====================  SIGNUP ADMIN  =======================
  @IsPublic()
  @Post('/admin/signup')
  @ApiOperation({ summary: 'Registrar un nuevo usuario administrador' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Usuario administrador creado correctamente',
  })
  @ApiResponse({ status: 400, description: 'El email ya está registrado' })
  @ApiResponse({ status: 409, description: 'El celular ya está registrado' })
  @UseInterceptors(
    FileInterceptor('profileImg', AuthController.fileUploadConfig()),
  )
  async create(
    @Body() createAuthDto: CreateAuthAdminDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('🚀 ~ AuthController ~ createAuthDto:', createAuthDto);
    try {
      if (createAuthDto.email) {
        const userExists = await this.userService.findByEmailRaw(
          createAuthDto.email,
        );
        if (userExists)
          throw new BadRequestException(
            `El email ${createAuthDto.email} ya está registrado`,
          );
      }

      // const checkPhone = await this.userService.findOneByPhoneRaw(
      //   createAuthDto.phoneNumber,
      // );
      // if (checkPhone)
      //   throw new ConflictException(
      //     `El celular ${createAuthDto.phoneNumber} ya está registrado`,
      //   );

      return await this.authService.create(createAuthDto, file?.filename);
    } catch (error) {
      if (file) deleteFile(profileImgFilePath(), file.filename);
      throw error;
    }
  }

  // ====================  LOGIN GOOGLE ADMIN  =========================
  @IsPublic()
  @UseGuards(GoogleAuthGuard)
  @Get('/google/login')
  @ApiOperation({ summary: 'Iniciar sesión con google (administrador)' })
  googleLogin() {}

  // ====================  GOOGLE CALLBACK  =========================
  @IsPublic()
  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  // @ApiOperation({ summary: 'Iniciar sesión con google (administrador)' })
  // @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  // @ApiBody({ type: LoginUserDto })
  async googCallback(@Request() req, @Res() res) {
    const user = await this.authService.validateGoogleUser(req.user);
    if (!user) {
      throw new BadRequestException('Error al iniciar sesión con Google');
    }
    res.redirect(
      `http://localhost:3000/auth/google/success?access_token=${user.myTokens.accessToken}&refresh_token=${user.myTokens.refreshToken}`,
    );
  }

  // ====================  LOGIN ADMIM LOCAL  =========================
  @IsPublic()
  @Post('/admin/signin')
  // @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Iniciar sesión (usuario o administrador)' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiBody({ type: LoginAdminDto })
  async loginAdminLocal(@Body() body: LoginAdminDto) {
    // console.log('Leegando el usuario local', req.user);
    // return req.user;
    return this.authService.loginAdmin(body);
  }

  // ====================  LOGIN USER  =========================
  @IsPublic()
  @Post('/user/signin')
  @ApiOperation({ summary: 'Iniciar sesión (usuario o administrador)' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiBody({ type: LoginUserDto })
  loginUser(@Body() loginUser: LoginUserDto) {
    return this.authService.loginUser(loginUser);
  }

  // ====================  LOGOUT USER  =========================
  // @IsPublic()
  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cerrar sesión actual (usuario autenticado)' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  logoutUser(@Request() req, @Body() body: LogoutUserDto) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logoutUser(
      req['user'],
      accessToken,
      body.refreshToken,
    );
  }

  // ====================  LOGOUT ALL DEVICES  =========================
  @Post('/logout-all')
  @ApiOperation({
    summary: 'Cerrar sesión en todos los dispositivos (por login)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesiones cerradas correctamente en todos los dispositivos',
  })
  @ApiBody({ type: LoginUserDto })
  logoutAllDevices(@Body() loginUser: LoginUserDto) {
    return this.authService.loginUser(loginUser);
  }

  // ====================  REFRESH TOKENS  =====================
  @IsPublic()
  @Post('/refresh-token')
  @ApiOperation({ summary: 'Refrescar tokens de acceso y actualización' })
  @ApiResponse({ status: 200, description: 'Tokens renovados correctamente' })
  @ApiBody({ type: RefreshTokenDto })
  refreshTokens(@Body() refreshToken: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshToken);
  }

  // ===========================================================
  //  📌 MÉTODOS AUXILIARES
  // ===========================================================

  /** Configuración de subida de archivos con multer */
  private static fileUploadConfig() {
    return {
      storage: diskStorage({
        destination: profileImgFilePath(),
        filename: fileRename,
      }),
      fileFilter: fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    };
  }
}
