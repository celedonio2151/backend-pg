import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FilterDateDto } from 'src/shared/dto/queries.dto';
import { MeterReadingsService } from 'src/router/meter-readings/meter-readings.service';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';

@Injectable()
export class ReportService {
  constructor(private readonly readingService: MeterReadingsService) {}
  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  async findAll() {
    return await this.readingService.sumAllMeterReadings();
  }

  async findOne(ci: number) {
    return 'Find One id';
  }
  async sumAndListCubicMeters(ci: number) {
    return await this.readingService.sumAllMeterReadingsByCI(ci);
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
