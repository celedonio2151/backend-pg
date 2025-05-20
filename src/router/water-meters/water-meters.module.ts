import { Module } from '@nestjs/common';
import { WaterMetersService } from './water-meters.service';
import { WaterMetersController } from './water-meters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterMeter } from './entities/water-meter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WaterMeter])],
  controllers: [WaterMetersController],
  providers: [WaterMetersService],
  exports: [WaterMetersService],
})
export class WaterMetersModule {}
