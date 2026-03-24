import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { fileFilter, fileRename } from 'src/helpers/file.filter';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { FilterDateDto, OrderQueryDTO } from 'src/shared/dto/queries.dto';
import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';
import { UpdateMeterReadingDto } from './dto/update-meter-reading.dto';
import { MeterReadingsService } from './meter-readings.service';

@ApiTags('Meter Reading')
@ApiBearerAuth()
@Controller('reading')
export class MeterReadingsController {
  constructor(private readonly meterReadingsService: MeterReadingsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva lectura de medidor' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos necesarios para crear una lectura de medidor',
    type: CreateMeterReadingDto,
  })
  @ApiResponse({ status: 201, description: 'Lectura creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @UseInterceptors(
    FileInterceptor('meterImage', {
      storage: diskStorage({
        destination: 'src/uploads/meterImages', // Directorio donde se guardará el archivo
        filename: fileRename,
      }),
      fileFilter: fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // Límite de tamaño del archivo: 5 MB
      },
    }),
  )
  create(@Body() createMeterReadingDto: CreateMeterReadingDto, @UploadedFile() file: Express.Multer.File) {
    return this.meterReadingsService.create(createMeterReadingDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las lecturas de medidores' })
  @ApiResponse({ status: 200, description: 'Listado de lecturas' })
  findAll(@Query() pagination: PaginationDto, @Query() date: FilterDateDto) {
    return this.meterReadingsService.findAllMeterReadings(pagination, date);
  }

  @Get('/ci/:ci')
  @ApiOperation({
    summary: 'Obtener lecturas de medidores por cédula de identidad',
  })
  @ApiParam({
    name: 'ci',
    description: 'Cédula de identidad del usuario',
    type: Number,
    example: 12345678,
  })
  @ApiResponse({ status: 200, description: 'Lecturas encontradas' })
  @ApiResponse({ status: 404, description: 'No se encontraron lecturas' })
  findReadingsInnerJoinMeterInvoiceByCI(
    @Param('ci') ci: number,
    @Query() pagination: PaginationDto,
    @Query() order: OrderQueryDTO,
  ) {
    return this.meterReadingsService.findMeterReadingsInnerJoinWaterInvoiceByCI(ci, order, pagination);
  }

  @Get(':meterId')
  @ApiOperation({
    summary: 'Obtener la última lectura de un medidor por su ID',
  })
  @ApiParam({
    name: 'meterId',
    description: 'ID del medidor de agua',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Última lectura encontrada' })
  @ApiResponse({ status: 404, description: 'No se encontró lectura' })
  findOne(@Param('meterId') meterId: string) {
    return this.meterReadingsService.findTheLastMeterReading(meterId);
  }

  @Get('id/:readingId')
  @ApiOperation({
    summary: 'Obtener una lectura de medidor específica por su ID',
  })
  @ApiParam({
    name: 'readingId',
    description: 'ID de la lectura del medidor',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({ status: 200, description: 'Lectura encontrada' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  findOneMeterReading(@Param('readingId') readingId: string) {
    return this.meterReadingsService.findOneById(readingId);
  }

  @Get('calculate/balance')
  @ApiOperation({
    summary: 'Calcular el balance basado en metros cúbicos consumidos',
  })
  @ApiQuery({
    name: 'cubic',
    description: 'Cantidad de metros cúbicos consumidos',
    required: true,
    example: 30,
  })
  @ApiResponse({ status: 200, description: 'Balance calculado' })
  calculateBalance(@Query('cubic') cubic: number) {
    return this.meterReadingsService.calculateBalance(cubic);
  }

  // ======== EDIT A METER READING  =======
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una lectura de medidor por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lectura del medidor',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiBody({
    description: 'Datos necesarios para actualizar una lectura de medidor',
    type: UpdateMeterReadingDto,
  })
  @ApiResponse({ status: 200, description: 'Lectura actualizada' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  update(@Param('id') id: string, @Body() updateMeterReadingDto: UpdateMeterReadingDto) {
    return this.meterReadingsService.update(id, updateMeterReadingDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una lectura de medidor por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la lectura del medidor',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({ status: 200, description: 'Lectura eliminada' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  remove(@Param('id') id: string) {
    return this.meterReadingsService.remove(+id);
  }

  // @Get('report/annual/:year')
  // @ApiOperation({
  //   summary: 'Obtener reporte anual de consumo y facturación por mes',
  // })
  // @ApiParam({
  //   name: 'year',
  //   description: 'Año para el reporte (ejemplo: 2024)',
  //   type: Number,
  //   example: 2024,
  // })
  // getAnnualReport(@Param('year') year: number) {
  //   return this.meterReadingsService.annualReport(year);
  // }
}
