import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MeterReadingsModule } from 'src/router/meter-readings/meter-readings.module';

@Module({
  imports: [MeterReadingsModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
