import { SetMetadata } from '@nestjs/common';
import { Config } from 'src/configs/config';
import { Role } from 'src/router/roles/entities/role.entity';

export const ROLES_KEY = Config().ROLES_KEY;
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
