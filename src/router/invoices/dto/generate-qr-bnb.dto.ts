import { Exclude, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';

export class GenerateQRCodeBNBDTO {
  @IsString()
  currency: string;
  @IsString()
  gloss: string;
  @IsNumber()
  amount: number;
  @IsDate()
  @Type(() => Date)
  expirationDate: string;
  @IsBoolean()
  singleUse: boolean;
  // @IsObject()
  @IsString()
  // @Exclude() // Excluir de la transformación a JSON
  additionalData: string | object;
  @IsNumber()
  destinationAccountId: number;
}
