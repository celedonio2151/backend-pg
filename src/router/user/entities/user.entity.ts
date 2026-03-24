import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { AuditableEntity } from 'src/configs/auditable-entity.config';
import { BoardDirector } from 'src/router/board-directors/entities/board-director.entity';
import { Role } from 'src/router/roles/entities/role.entity';
import { WaterMeter } from 'src/router/water-meters/entities/water-meter.entity';
export enum Providers {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  LOCAL = 'LOCAL',
  GITHUB = 'GITHUB',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
}
@Entity()
export class User extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'UUID del usuario' })
  _id: string;

  @ApiProperty({ description: 'Cédula de identidad' })
  @Column({ unique: true, nullable: true, default: null })
  @Index('IDX_USER_CI_UNIQUE', { unique: true })
  ci: number;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Nombre del usuario' })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  @ApiProperty({ description: 'Apellido del usuario' })
  surname: string;

  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @Column({ unique: true, nullable: true })
  @Index('IDX_USER_EMAIL_UNIQUE', { unique: true })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @ApiProperty({ description: 'Contraseña encriptada del usuario' })
  password: string;

  @Column({ default: null, nullable: true })
  @ApiProperty({ required: false })
  codeVerification: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({ description: 'Número de celular', example: '72511122' })
  @Column({ unique: true, type: 'varchar', length: 12, default: null })
  @Index('IDX_USER_PHONE_UNIQUE', { unique: true })
  phoneNumber: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  phoneVerified: boolean;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    type: 'string',
    format: 'date',
  })
  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ default: 'defaultUser.png' })
  @ApiProperty({ description: 'Imagen de perfil' })
  profileImg: string;

  @Column('json', { default: null, nullable: true })
  @ApiProperty({ required: false, description: 'Tokens de acceso' })
  accessToken: string[];

  @Column('json', { default: null, nullable: true })
  @ApiProperty({ required: false, description: 'Tokens de refresco' })
  refreshToken: string[];

  @ApiProperty({ description: 'Si el usuario esta autenticado con google' })
  @Column({ type: 'enum', enum: Providers, default: Providers.LOCAL })
  authProvider: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Estado activo/inactivo del usuario' })
  status: boolean;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({ name: 'user_role' })
  @ApiProperty({ type: () => [Role], description: 'Roles del usuario' })
  roles: Role[];

  @OneToMany(() => WaterMeter, (waterMeter) => waterMeter.user)
  waterMeters: WaterMeter[];

  @OneToMany(() => BoardDirector, (boardDirector) => boardDirector.user, {
    cascade: true,
  })
  boardDirector: BoardDirector;
}
