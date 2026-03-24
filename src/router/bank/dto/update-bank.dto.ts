import { PartialType } from '@nestjs/swagger';
import { BnbQrPaymentDto } from './create-bank.dto';

export class UpdateBankDto extends PartialType(BnbQrPaymentDto) {}
