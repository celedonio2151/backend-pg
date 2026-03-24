import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { StatusQueryDto } from 'src/shared/dto/queries.dto';
import { BoardDirectorsService } from './board-directors.service';
import { CreateBoardDirectorDto } from './dto/create-board-director.dto';
import { UpdateBoardDirectorDto } from './dto/update-board-director.dto';

@ApiTags('Mesa Directiva')
@ApiBearerAuth()
@Controller('board-directors')
export class BoardDirectorsController {
  constructor(private readonly boardDirectorsService: BoardDirectorsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo miembro de la mesa directiva' })
  @ApiBody({ type: CreateBoardDirectorDto })
  @ApiResponse({ status: 201, description: 'Miembro creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El miembro ya existe' })
  create(@Body() createBoardDirectorDto: CreateBoardDirectorDto) {
    return this.boardDirectorsService.create(createBoardDirectorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los miembros de la mesa directiva' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Listado de miembros' })
  findAll(@Query() pagination: PaginationDto, @Query() status: StatusQueryDto) {
    return this.boardDirectorsService.findAll(pagination, status);
  }

  @Get('/id/:id')
  @ApiOperation({ summary: 'Buscar miembro por ID' })
  @ApiParam({ name: 'id', description: 'ID del miembro', type: String })
  @ApiResponse({ status: 200, description: 'Miembro encontrado' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  findOne(@Param('id') id: string) {
    return this.boardDirectorsService.findOneById(id);
  }

  @Get('/user-id/:userId')
  @ApiParam({
    name: ':id',
    description: 'ID del usuario asociado',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Miembro encontrado' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  findOneByUserId(@Param('userId') userId: string) {
    return this.boardDirectorsService.findOneByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar parcialmente un miembro de la mesa directiva',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del miembro a actualizar',
    type: String,
  })
  @ApiBody({ type: UpdateBoardDirectorDto })
  @ApiResponse({ status: 200, description: 'Miembro actualizado' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  update(@Param('id') id: string, @Body() updateBoardDirectorDto: UpdateBoardDirectorDto) {
    return this.boardDirectorsService.update(id, updateBoardDirectorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un miembro de la mesa directiva' })
  @ApiParam({
    name: 'id',
    description: 'ID del miembro a eliminar',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Miembro eliminado' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  remove(@Param('id') id: string) {
    return this.boardDirectorsService.remove(+id);
  }
}
