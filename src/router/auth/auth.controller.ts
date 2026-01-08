import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';

import { ConfigService } from '@nestjs/config';
import { IsPublic } from 'src/decorators/public.decorator';
import { GoogleAuthGuard } from 'src/guards/google-auth.guard';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
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
import { RequestWithUser } from './interface/payload.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
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
    // Log removido para producción
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
  @ApiOperation({ summary: 'Callback de Google OAuth (Manejo interno)' })
  @ApiResponse({
    status: 200,
    description: 'Redirecciona al frontend con los tokens en la URL',
  })
  async googCallback(@Request() req, @Res() res) {
    const user = await this.authService.validateGoogleUser(req.user);
    if (!user) {
      throw new BadRequestException('Error al iniciar sesión con Google');
    }
    const frontendUrl = this.configService.get('FRONTEND');
    res.redirect(
      `${frontendUrl}/auth/google/success?access_token=${user.myTokens.accessToken}&refresh_token=${user.myTokens.refreshToken}`,
    );
  }

  // ====================  LOGIN ADMIM LOCAL  =========================
  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post('/admin/signin')
  @ApiOperation({ summary: 'Iniciar sesión (usuario o administrador)' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiBody({ type: LoginAdminDto })
  async loginAdminLocal(@Req() req: RequestWithUser) {
    // Aquí req.user ya está autenticado
    return req.user;
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
  // @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión actual (Invalidar Refresh Token)' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  logoutUser(@Req() req: RequestWithUser, @Body() body: LogoutUserDto) {
    return this.authService.logoutUser(
      req['user'],
      req['accessToken'],
      body.refreshToken,
    );
  }

  // ====================  LOGOUT ALL DEVICES  =========================
  @Post('/logout-all')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cerrar todas las sesiones del usuario',
    description: 'Invalida todos los refresh tokens asociados al usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesiones cerradas correctamente en todos los dispositivos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: LoginUserDto })
  logoutAllDevices(@Req() req: RequestWithUser, @Body() body: LogoutUserDto) {
    return this.authService.logoutUserAllDevices(
      req['user'],
      req['accessToken'],
      body.refreshToken,
    );
  }

  // ====================  REFRESH TOKENS  =====================
  @IsPublic()
  @Post('/refresh-token')
  @ApiOperation({ summary: 'Refrescar tokens de acceso y actualización' })
  @ApiResponse({ status: 200, description: 'Tokens renovados correctamente' })
  @ApiBody({ type: RefreshTokenDto })
  refreshTokens(@Body() body: RefreshTokenDto) {
    return this.authService.refreshTokens(body);
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
