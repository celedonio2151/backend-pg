import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 8000,
      maxRedirects: 5,
    }),
  ],
  controllers: [BankController],
  providers: [BankService],
  exports: [BankService],
})
export class BankModule {}
