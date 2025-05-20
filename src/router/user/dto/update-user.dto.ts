import { PartialType, PickType } from '@nestjs/swagger';

import { CreateUserDto } from 'src/router/user/dto/create-user.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, [
    'name',
    'surname',
    'phoneNumber',
    'birthDate',
    'profileImg',
    'password',
    'email',
    'status',
    'role_id',
  ] as const),
) {}
