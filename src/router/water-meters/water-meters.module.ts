import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { WaterMeter } from './entities/water-meter.entity';
import { WaterMetersController } from './water-meters.controller';
import { WaterMetersService } from './water-meters.service';

@Module({
  imports: [TypeOrmModule.forFeature([WaterMeter, User])],
  controllers: [WaterMetersController],
  providers: [WaterMetersService],
  exports: [WaterMetersService],
})
export class WaterMetersModule {}
