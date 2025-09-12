import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { AuditableEntity } from 'src/configs/auditable-entity.config';
import { Invoice } from 'src/router/invoices/entities/invoice.entity';

@Entity()
export class InvoiceTable extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @OneToMany(() => Invoice, (invoice) => invoice.invoiceTable, {
    cascade: true,
    eager: true,
  })
  invoices: Invoice[];
}
