import { AuditableEntity } from 'src/configs/auditable-entity.config';
import { MeterReading } from 'src/router/meter-readings/entities/meter-reading.entity';
import { User } from 'src/router/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class WaterMeter extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ unique: true })
  meter_number: number;

  @Column({ default: true })
  status: boolean;

  @Column({ default: 99999 })
  maximum_capacity: number;

  @ManyToOne(() => User, (user) => user.waterMeters, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  user: User;

  @OneToMany(
    () => MeterReading,
    (meterReading) => meterReading.waterMeter,
    // { eager: true },
  )
  meterReadings: MeterReading[];
}
