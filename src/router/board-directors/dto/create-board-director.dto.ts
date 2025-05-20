import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateBoardDirectorDto {
  @IsString()
  userId: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsString()
  positionRole: string;

  @IsString()
  @IsOptional()
  description?: string;

  // user: User;
}
