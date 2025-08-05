import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';

import { deleteFile } from 'src/helpers/delete.file';
import {
  fileFilter,
  fileRename,
  profileImgFilePath,
} from 'src/helpers/file.filter';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { NameQueryDTO, StatusQueryDto } from 'src/shared/dto/queries.dto';
import { RequestWithUser } from '../auth/interface/payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El celular ya está registrado' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @UseInterceptors(
    FileInterceptor('profileImg', UserController.fileUploadConfig()),
  )
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.create(createUserDto, file?.filename);
  }
  // ===========================================================
  //  📌 OBTIENE LISTA DE USUARIOS
  // ===========================================================
  @Get()
  @ApiOperation({
    summary: 'Obtener lista de usuarios paginados y filtrados por estado',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: Boolean })
  @ApiQuery({ name: 'name', required: false, type: String })
  findAll(
    @Query() pagination: PaginationDto,
    @Query() name: NameQueryDTO,
    @Query() status: StatusQueryDto,
  ) {
    return this.userService.findAll(pagination, status);
  }
  // ===========================================================
  //  📌 OBTIENE A SI MISMO, ES DECIR EL USUARIO DEL TOKEN
  // ===========================================================
  @Get('/me')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Datos del usuario autenticado' })
  findMe(@Request() req: RequestWithUser) {
    return this.userService.getMeById(req.user._id);
  }

  // ===========================================================
  //  📌 OBTIENE UN USUARIO POR SU ID
  // ===========================================================
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por su ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  // ===========================================================
  //  📌 ACTUALIZARZE A SI MISMO
  // ===========================================================
  @Patch('/update/me')
  @ApiOperation({
    summary: 'Actualizar datos de un usuario, incluyendo imagen de perfil',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    description: 'Formulario para actualizar un usuario',
    type: UpdateUserDto,
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  @UseInterceptors(
    FileInterceptor('profileImg', UserController.fileUploadConfig()),
  )
  async updatemMe(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      return await this.userService.updateMe(id, updateUserDto, file?.filename);
    } catch (error) {
      if (file) {
        deleteFile(profileImgFilePath(), file.filename);
      }
      throw error;
    }
  }

  // ===========================================================
  //  📌 ACTUALIZAR UN USUARIO POR SU ID
  // ===========================================================
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar datos de un usuario',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    description: 'Formulario para actualizar un usuario',
    type: UpdateUserDto,
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }

  // ===========================================================
  //  📌 ELIMINAR UN USUARIO
  // ===========================================================
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por su ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
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
