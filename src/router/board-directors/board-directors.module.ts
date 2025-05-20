import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BoardDirectorsService } from './board-directors.service';
import { BoardDirectorsController } from './board-directors.controller';
import { BoardDirector } from 'src/router/board-directors/entities/board-director.entity';
import { UserModule } from 'src/router/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([BoardDirector]), UserModule],
  controllers: [BoardDirectorsController],
  providers: [BoardDirectorsService],
})
export class BoardDirectorsModule {}
