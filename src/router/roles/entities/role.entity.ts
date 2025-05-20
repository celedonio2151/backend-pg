import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { AuditableEntity } from 'src/configs/auditable-entity.config';
import { User } from 'src/router/user/entities/user.entity';

@Entity()
export class Role extends AuditableEntity {
  @ApiProperty({
    description: 'ID único del rol',
    example: '1a2b3c4d-5678-9101-1121-314151617181',
  })
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'ADMIN',
  })
  @IsString()
  @Length(3, 50)
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Rol con acceso administrativo total.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Estado del rol (activo/inactivo)',
    example: true,
  })
  @IsBoolean()
  @Column({ default: true })
  status: boolean;

  // Relación opcional: un rol puede estar asignado a varios usuarios
  // descomenta esto si ya estás listo para esa relación
  @ManyToMany(() => User, (user) => user.roles, { onDelete: 'CASCADE' })
  users: User[];
}
