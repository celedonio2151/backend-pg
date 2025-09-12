import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InvoicesModule } from '../invoices/invoices.module';
import { WaterMetersModule } from '../water-meters/water-meters.module';
import { InvoiceTable } from './entities/invoice-table.entity';
import { InvoiceTableController } from './invoice-table.controller';
import { InvoiceTableService } from './invoice-table.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoiceTable]),
    InvoicesModule,
    WaterMetersModule,
  ],
  controllers: [InvoiceTableController],
  providers: [InvoiceTableService],
})
export class InvoiceTableModule {}
