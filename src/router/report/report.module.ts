import { Module } from '@nestjs/common';
import { MeterReadingsModule } from 'src/router/meter-readings/meter-readings.module';
import { WaterMetersModule } from '../water-meters/water-meters.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [MeterReadingsModule, WaterMetersModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
