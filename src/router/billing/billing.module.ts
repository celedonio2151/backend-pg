import { TypeOrmModule } from '@nestjs/typeorm';
import { Billing } from 'src/router/billing/entities/billing.entity';

import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Billing])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
