import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Invoice } from 'src/router/invoices/entities/invoice.entity';
import { AuditableEntity } from 'src/configs/auditable-entity.config';

export enum BnbQrStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

/**
 * Entidad independiente para gestionar los códigos QR de BNB.
 * Relación 1:1 con Invoice.
 */
@Entity('bnb_qr_payments')
export class BnbQrPayment extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  /**
   * ID del QR generado por BNB
   */
  @Column({ unique: true })
  qr_id: string;

  /**
   * Imagen QR en base64
   */
  @Column({ type: 'text' })
  qr_image: string;

  /**
   * Monto del QR
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  /**
   * Moneda (BOB o USD)
   */
  @Column({ default: 'BOB' })
  currency: string;

  /**
   * Gloss/Descripción enviada a BNB
   */
  @Column()
  gloss: string;

  /**
   * Estado del QR
   */
  @Column({ type: 'enum', enum: BnbQrStatus, default: BnbQrStatus.PENDING })
  status: BnbQrStatus;

  /**
   * Fecha de expiración del QR
   */
  @Column({ type: 'timestamp' })
  expires_at: Date;

  /**
   * ID de transacción de BNB (cuando se paga)
   */
  @Column({ nullable: true })
  transaction_id: string;

  /**
   * Nombre del pagador (cuando se paga)
   */
  @Column({ nullable: true })
  payer_name: string;

  /**
   * Fecha de pago
   */
  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  // FK a Invoice
  @Column('uuid')
  invoice_id: string;

  @OneToOne(() => Invoice, (invoice) => invoice.qrPayment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
