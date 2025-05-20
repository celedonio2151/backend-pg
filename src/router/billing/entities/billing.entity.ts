import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

import { AuditableEntity } from 'src/configs/auditable-entity.config';

@Entity()
export class Billing extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column({ type: 'float' })
  min_cubic_meters: number; // Mínimo de m³ aplicable

  @Column({ type: 'float' })
  max_cubic_meters: number; // Máximo de m³ aplicable

  @Column({ type: 'float' })
  base_rate: number; // Tarifa base

  @Column({ type: 'float', default: 0 })
  rate: number; // Tarifa variable por m³

  @Column('varchar', { default: null, nullable: true, length: 255 })
  description: string; // Descripción opcional
}
