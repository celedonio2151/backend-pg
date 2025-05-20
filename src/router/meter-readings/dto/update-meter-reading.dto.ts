import { CreateMeterReadingDto } from './create-meter-reading.dto';
import { IsDate, IsJSON, IsNumber, IsObject, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

class BeforeMonth {
  @Type(() => Date)
  @IsDate()
  readonly date: Date;

  @IsNumber()
  readonly meterValue: number;
}

export class UpdateMeterReadingDto extends PartialType(CreateMeterReadingDto) {
  // @IsObject()
  // editBeforeMonth: BeforeMonth;
}
