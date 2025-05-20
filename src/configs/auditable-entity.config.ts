// import { Field, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
} from 'typeorm';

// @ObjectType()
@Entity()
export abstract class AuditableEntity extends BaseEntity {
  @CreateDateColumn({ type: 'timestamp' })
  // @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  // @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  // @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}
