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
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FilterDateDto } from 'src/shared/dto/queries.dto';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportService.create(createReportDto);
  }

  // Suma todas las lecturas y devuelve la suma y la lectura | fecha, cubos
  @Get()
  findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(+id);
  }

  // Suma todas las lecturas de un CI y devuelve suma y la lectura fecha, cubos
  @Get('/ci/:ci')
  sumByCi(@Param('ci') ci: number) {
    return this.reportService.sumAndListCubicMeters(ci);
  }

  @Get('/sum-by-month/global')
  sumByMonth(@Param('ci') ci: number) {
    return this.reportService.sumAndListCubicMeters(ci);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportService.update(+id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportService.remove(+id);
  }
}
