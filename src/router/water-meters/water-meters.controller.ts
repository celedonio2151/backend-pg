import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { FilterDateDto, StatusQueryDto } from 'src/shared/dto/queries.dto';
import { CreateWaterMeterDto } from './dto/create-water-meter.dto';
import { UpdateWaterMeterDto } from './dto/update-water-meter.dto';
import { WaterMetersService } from './water-meters.service';

@ApiTags('Medidores de Agua')
@Controller('meter')
export class WaterMetersController {
  constructor(private readonly waterMetersService: WaterMetersService) {}

  // =========================== CREA UN NUVEO MEDIDOR DE AGUA ===========================
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo medidor de agua' })
  @ApiBody({
    description: 'Datos necesarios para crear un medidor de agua',
    type: CreateWaterMeterDto,
  })
  create(@Body() body: CreateWaterMeterDto) {
    return this.waterMetersService.createOnlyMeter(body);
  }

  // =========================== LIST ALL WATER METERS ===========================
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los medidores de agua con paginación y estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de medidores de agua',
    schema: {
      example: {
        limit: 10,
        offset: 0,
        total: 2,
        // waterMeters: WaterMeter,
      },
    },
  })
  @ApiQuery({
    name: 'status',
    description: 'Estado del medidor (activo/inactivo)',
    required: false,
  })
  findAll(@Query() pagination: PaginationDto, @Query() status: StatusQueryDto) {
    return this.waterMetersService.findAll(pagination, status.status);
  }

  // =========================== OBTIENE LECTURAS DE UN MES ESPECIFICO ===========================
  @Get('read-month')
  @ApiOperation({
    summary: 'Obtener lecturas de medidores de agua en un mes específico',
  })
  @ApiQuery({
    name: 'status',
    description: 'Estado del medidor (activo/inactivo)',
    required: false,
  })
  // @ApiQuery({
  //   name: 'date',
  //   description: 'Fechas para filtrar lecturas',
  //   required: true,
  // })
  findAllReadMonth(
    @Query() pagination: PaginationDto,
    @Query() status: StatusQueryDto,
    @Query() date: FilterDateDto,
  ) {
    return this.waterMetersService.findAllReadingOneMonth(
      pagination,
      date,
      status.status,
    );
  }

  // =========================== OBTIENE MEDIDORES POR CEDULA DE IDENTIDAD ===========================
  @Get(':ci')
  @ApiOperation({
    summary: 'Obtener medidores de agua por cédula de identidad',
  })
  @ApiParam({
    name: 'ci',
    description: 'Cédula de identidad del usuario',
    type: Number,
  })
  findManyByCI(@Param('ci') ci: number) {
    return this.waterMetersService.findManyByCI(ci);
  }

  // =========================== OBTIENE MEDIDORES DE AGUA POR SU ID ===========================
  @Get('/id/:meterId')
  @ApiOperation({ summary: 'Obtener un medidor de agua por ID' })
  @ApiParam({
    name: 'meterId',
    description: 'ID del medidor de agua',
    type: String,
  })
  findOne(@Param('meterId') id: string) {
    return this.waterMetersService.findOneById(id);
  }

  // =========================== ACTUALIZA UN MEDIDOR DE AGUA POR SU ID ===========================
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un medidor de agua por ID' })
  @ApiParam({ name: 'id', description: 'ID del medidor de agua', type: String })
  @ApiBody({
    description: 'Datos necesarios para actualizar un medidor de agua',
    type: UpdateWaterMeterDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateWaterMeterDto: UpdateWaterMeterDto,
  ) {
    return this.waterMetersService.update(id, updateWaterMeterDto);
  }

  // =========================== ELIMINA UN MEDIDOR DE AGUA POR SU ID ===========================
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un medidor de agua por ID' })
  @ApiParam({ name: 'id', description: 'ID del medidor de agua', type: String })
  remove(@Param('id') id: string) {
    return this.waterMetersService.remove(id);
  }
}
