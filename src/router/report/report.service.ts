import { Injectable, NotAcceptableException } from '@nestjs/common';
import { MeterReadingsService } from 'src/router/meter-readings/meter-readings.service';
import { FilterDateDto } from 'src/shared/dto/queries.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly readingService: MeterReadingsService) {}

  async findAll() {
    return await this.readingService.sumAllMeterReadings();
  }

  async findOne(ci: number) {
    return 'Find One id';
  }

  async sumAndListCubicMeters(ci: number) {
    return await this.readingService.sumAllMeterReadingsByCI(ci);
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

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
