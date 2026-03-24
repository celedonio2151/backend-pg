import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BankService } from './bank.service';
import { BnbQrPaymentDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  create(@Body() body: BnbQrPaymentDto) {
    return this.bankService.create(body);
  }

  // @Get()
  // findAll() {
  //   return this.bankService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.bankService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
  //   return this.bankService.update(+id, updateBankDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.bankService.remove(+id);
  // }
}
