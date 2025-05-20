import { AuditableEntity } from 'src/configs/auditable-entity.config';
import { MeterReading } from 'src/router/meter-readings/entities/meter-reading.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class WaterMeter extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ unique: false })
  ci: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column({ unique: true })
  meter_number: number;

  @Column({ default: true })
  status: boolean;

  @OneToMany(
    (type) => MeterReading,
    (meterReading) => meterReading.waterMeter,
    // { eager: true },
  )
  meterReadings: MeterReading[];
}
