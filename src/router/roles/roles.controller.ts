import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';

@ApiTags('Roles')
@Controller('role')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({
    status: 201,
    description: 'Rol creado correctamente',
    type: Role,
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles', type: [Role] })
  findAll(@Query() pagination: PaginationDto) {
    return this.rolesService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por su ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Rol encontrado', type: Role })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un rol por su ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Rol actualizado', type: Role })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol por su ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Rol eliminado' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
