import { AuditableEntity } from 'src/configs/auditable-entity.config';
import { User } from 'src/router/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class BoardDirector extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  positionRole: string;

  @Column()
  order: number; // Para mantener el orden jerárquico (1 siendo el más alto)

  @Column({ default: null, nullable: true })
  description: string;

  @Column({ default: true })
  status: boolean;

  @OneToOne(() => User, (user) => user.boardDirector, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
