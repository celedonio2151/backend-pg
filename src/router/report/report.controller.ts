import {
    Controller,
    Get,
    Param,
    Query
} from '@nestjs/common';
import { FilterDateDto } from 'src/shared/dto/queries.dto';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Suma todas las lecturas y devuelve la suma y la lectura | fecha, cubos
  @Get()
  findAll() {
    return this.reportService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.reportService.findOne(+id);
  // }

  // Suma todas las lecturas de un CI y devuelve suma y la lectura fecha, cubos
  @Get('/ci/:ci')
  sumByCi(@Param('ci') ci: number) {
    return this.reportService.sumAndListCubicMeters(ci);
  }

  @Get('/sum-by-month/global')
  sumByMonth(@Query() date: FilterDateDto) {
    return this.reportService.sumAndListCubicMetersByMonth(date);
  }

  @Get('/monthly')
  reportMonthly(@Query() dates: FilterDateDto) {
    return this.reportService.monthlyReport(dates);
  }

  @Get('/annual')
  reportAnnual(@Query() dates: FilterDateDto) {
    return this.reportService.annualReport(dates);
  }

  @Get('/annual-by-meter')
  reportAnnualByMeter(@Query() dates: FilterDateDto) {
    return this.reportService.annualReportByMeter(dates);
  }
}
