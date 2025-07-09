import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { CreateBillingDto } from './create-billing.dto';

export class UpdateBillingDto extends PartialType(CreateBillingDto) {}

export class UpdateBillingsDto extends PartialType(CreateBillingDto) {
  @ApiProperty({
    description: 'ID de la tarifa de facturación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  readonly _id: string;
}
