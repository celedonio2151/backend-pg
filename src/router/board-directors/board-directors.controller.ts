import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { BoardDirectorsService } from './board-directors.service';
import { CreateBoardDirectorDto } from './dto/create-board-director.dto';
import { UpdateBoardDirectorDto } from './dto/update-board-director.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { StatusQueryDto } from 'src/shared/dto/queries.dto';

@ApiTags('Mesa Directiva')
@Controller('board-directors')
export class BoardDirectorsController {
  constructor(private readonly boardDirectorsService: BoardDirectorsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo miembro de la mesa directiva' })
  @ApiBody({ type: CreateBoardDirectorDto })
  create(@Body() createBoardDirectorDto: CreateBoardDirectorDto) {
    return this.boardDirectorsService.create(createBoardDirectorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los miembros de la mesa directiva' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'status',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado (true o false)',
  })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status: StatusQueryDto,
  ) {
    return this.boardDirectorsService.findAll(pagination, status);
  }

  @Get('/id/:id')
  @ApiOperation({ summary: 'Buscar miembro por ID' })
  @ApiParam({ name: 'id', description: 'ID del miembro', type: String })
  findOne(@Param('id') id: string) {
    return this.boardDirectorsService.findOneById(id);
  }

  @Get('/user-id/:userId')
  @ApiOperation({ summary: 'Buscar miembro por ID de usuario' })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario asociado',
    type: String,
  })
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
  update(
    @Param('id') id: string,
    @Body() updateBoardDirectorDto: UpdateBoardDirectorDto,
  ) {
    return this.boardDirectorsService.update(+id, updateBoardDirectorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un miembro de la mesa directiva' })
  @ApiParam({
    name: 'id',
    description: 'ID del miembro a eliminar',
    type: String,
  })
  remove(@Param('id') id: string) {
    return this.boardDirectorsService.remove(+id);
  }
}
