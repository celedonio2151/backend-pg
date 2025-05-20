import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from 'src/router/user/entities/user.entity';
import { HashService } from 'src/router/auth/hashing/password.hash';
import { RolesModule } from '../roles/roles.module';
import { WaterMetersModule } from 'src/router/water-meters/water-meters.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RolesModule, WaterMetersModule],
  controllers: [UserController],
  providers: [UserService, HashService],
  exports: [UserService],
})
export class UserModule {}
