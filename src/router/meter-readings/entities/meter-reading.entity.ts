import { AuditableEntity } from 'src/configs/auditable-entity.config';
import { Invoice } from 'src/router/invoices/entities/invoice.entity';
import { WaterMeter } from 'src/router/water-meters/entities/water-meter.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class MeterReading extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column()
  date: Date;

  @Column('simple-json')
  beforeMonth: { date: Date; value: number };

  @Column('simple-json')
  lastMonth: { date: Date; value: number };

  @Column()
  cubicMeters: number;

  @Column()
  balance: number;

  @Column({ nullable: true })
  meterImage: string;

  @Column('varchar', { length: 200, nullable: true })
  description: string;

  @ManyToOne(() => WaterMeter, (waterMeter) => waterMeter.meterReadings, {
    eager: true,
  })
  @JoinColumn({ name: 'water_meter_id' })
  waterMeter: WaterMeter;

  @OneToOne(() => Invoice, (invoice) => invoice.meterReading, {
    cascade: true,
  })
  invoice: Invoice;
}
