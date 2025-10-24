import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ nullable: true })
  role: string;

  @Column()
  method: string;

  @Column()
  endpoint: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column('json', { nullable: true })
  body: any;

  @Column('json', { nullable: true })
  response: any;

  @CreateDateColumn()
  timestamp: Date;
}
