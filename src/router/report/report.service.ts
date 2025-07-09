import { Injectable, NotAcceptableException } from '@nestjs/common';
import { MeterReadingsService } from 'src/router/meter-readings/meter-readings.service';
import { FilterDateDto } from 'src/shared/dto/queries.dto';
import { WaterMetersService } from '../water-meters/water-meters.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly readingService: MeterReadingsService,
    private readonly waterMeterService: WaterMetersService,
  ) {}

  async findAll() {
    return await this.readingService.sumAllMeterReadings();
  }

  async findOne(ci: number) {
    return 'Find One id';
  }

  async sumAndListCubicMeters(ci: number) {
    return await this.readingService.sumAllMeterReadingsByCI(ci);
  }

  async sumAndListCubicMetersByMonth(date: FilterDateDto) {
    return await this.readingService.sumAllMeterReadingsByMonth(date);
  }

  async annualReportByMeter(date: FilterDateDto) {
    return await this.waterMeterService.annualReportByMeter(date);
  }

  async monthlyReport(dates: FilterDateDto) {
    const { startDate, endDate } = dates;
    if (!startDate || !endDate) {
      throw new NotAcceptableException('Fecha de inicio y fin son requeridas');
    }
    return await this.readingService.monthlyReport(dates);
  }

  async annualReport(dates: FilterDateDto) {
    const { startDate, endDate } = dates;
    if (!startDate || !endDate) {
      throw new NotAcceptableException('Fecha de inicio y fin son requeridas');
    }
    return await this.readingService.annualReport(dates);
  }
}
