import { AuditableEntity } from 'src/configs/auditable-entity.config';
import { MeterReading } from 'src/router/meter-readings/entities/meter-reading.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Invoice extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column()
  amountDue: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ default: true })
  status: boolean;

  @OneToOne(() => MeterReading, (meterReading) => meterReading.invoice, {
    eager: true,
  })
  @JoinColumn({ name: 'meter_reading_id' })
  meterReading: MeterReading;
}
