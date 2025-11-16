import { PartialType, PickType } from '@nestjs/swagger';
import { CreateWaterMeterDto } from './create-water-meter.dto';

// Extender obligatorio numero de medidor y user_id y estatus
export class UpdateWaterMeterDto extends PartialType(
  PickType(CreateWaterMeterDto, ['user_id', 'status'] as const),
) {}
