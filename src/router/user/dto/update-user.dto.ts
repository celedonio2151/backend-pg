import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, [
    'name',
    'surname',
    'phoneNumber',
    'birthDate',
    'profileImg',
    'password',
    'status',
    'role_id',
  ] as const),
) {
  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({
    required: false,
    type: [Number],
    example: [123456],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Min(3, { each: true })
  @Max(999999999, { each: true })
  meter_numbers?: number[];
}
