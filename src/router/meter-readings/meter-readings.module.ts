import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MeterReadingsService } from './meter-readings.service';
import { MeterReadingsController } from './meter-readings.controller';
import { MeterReading } from './entities/meter-reading.entity';
import { WaterMetersModule } from 'src/router/water-meters/water-meters.module';
import { BillingModule } from 'src/router/billing/billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MeterReading]),
    WaterMetersModule,
    BillingModule,
  ],
  controllers: [MeterReadingsController],
  providers: [MeterReadingsService],
  exports: [MeterReadingsService],
})
export class MeterReadingsModule {}
