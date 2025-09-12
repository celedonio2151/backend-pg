import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MeterReadingsModule } from 'src/router/meter-readings/meter-readings.module';
import { PrinterModule } from 'src/router/printer/printer.module';
import { BankModule } from '../bank/bank.module';
import { WaterMetersModule } from '../water-meters/water-meters.module';
import { Invoice } from './entities/invoice.entity';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Invoice]),
    PrinterModule,
    MeterReadingsModule,
    BankModule,
    WaterMetersModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
