import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BankController } from './bank.controller';
import { BankService } from './bank.service';
import { BnbQrPayment } from './entities/bank.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BnbQrPayment]),
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 5,
    }),
  ],
  controllers: [BankController],
  providers: [BankService],
  exports: [BankService],
})
export class BankModule {}
