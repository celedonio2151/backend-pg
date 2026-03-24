import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('role')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

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
}
