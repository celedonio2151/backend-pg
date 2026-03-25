import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, Not, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

import { ConfigService } from '@nestjs/config';
import { deleteFile } from 'src/helpers/delete.file';
import { profileImgFilePath } from 'src/helpers/file.filter';
import { CreateGoogleUserDto } from 'src/router/auth/dto/create-auth.dto';
import { HashService } from 'src/router/auth/hashing/password.hash';
import { CreateUserDto } from 'src/router/user/dto/create-user.dto';
import { Providers, User } from 'src/router/user/entities/user.entity';
import { CreateWaterMeterDto } from 'src/router/water-meters/dto/create-water-meter.dto';
import { WaterMetersService } from 'src/router/water-meters/water-meters.service';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { StatusQueryDto } from 'src/shared/dto/queries.dto';
import { RolesService } from '../roles/roles.service';
import { handlePostgresDuplicateError } from 'src/helpers/errorHandlerPostgres';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly roleService: RolesService,
    private readonly waterService: WaterMetersService,
    private readonly hashService: HashService,
  ) {}

  // ========== CREA ROLES POR DEFECTO ==========
  async onApplicationBootstrap() {
    const role = await this.roleService.findOneByName('ADMIN');
    const defaultUser: CreateUserDto = {
      ci: 12345678,
      phoneNumber: '123456789',
      name: 'Admin',
      surname: 'Admin',
      email: 'admin@gmail.com',
      password: await this.hashService.encrypt('123456789'),
      role_id: [role._id],
    };

    const user = await this.userRepository.findOne({
      where: { email: defaultUser.email },
    });
    if (!user) await this.create(defaultUser);
  }

  // ========== CREA UN NUEVO USUARIO ===========
  async create(body: CreateUserDto, filename?: string) {
    if (body.email) {
      const user = await this.findByEmailRaw(body.email);
      if (user) throw new ConflictException(`Email ${body.email} ya existe`);
    }
    if (await this.findOneByPhoneRaw(body.phoneNumber))
      throw new ConflictException(
        `El celular ${body.phoneNumber} ya esta registrado`,
      );
    const ci = await this.findOneUserByCIRaw(body.ci);
    if (ci) throw new ConflictException(`El ci ${body.ci} ya esta registrado`);
    // buscar si el medidor ya esta registrado
    if (body.meter_number) {
      const waterMeter = await this.waterService.findOneByMeterNumberRaw(
        body.meter_number,
      );
      if (waterMeter)
        throw new ConflictException(
          `El medidor ${body.meter_number} ya esta registrado`,
        );
    }
    const newUser = this.userRepository.create(body);
    if (body.role_id?.length) {
      const roles = await Promise.all(
        body.role_id.map((roleId) => this.roleService.findOneById(roleId)),
      );
      newUser.roles = roles;
    } else {
      const findRoles = await this.roleService.findOneByNameRaw('USER');
      if (!findRoles)
        throw new InternalServerErrorException('Rol USER no encontrado');
      newUser.roles = [findRoles]; // Guarda con el rol USER
    }

    if (filename) newUser.profileImg = filename;
    await this.userRepository.save(newUser);
    // Si hay numero de medidor registrar
    if (body.meter_number) {
      const body2: CreateWaterMeterDto = {
        meter_number: body.meter_number,
        user_id: newUser._id,
      };
      await this.waterService.create(body2);
    }
    newUser.profileImg =
      this.configService.get('HOST_ADMIN') +
      'profileImgs/' +
      newUser.profileImg;
    return newUser;
  }

  async createWithGoogle(body: CreateGoogleUserDto) {
    const user = await this.findByEmailRaw(body.email);
    if (user) throw new ConflictException(`Email ${body.email} ya existe`);
    const newUser = this.userRepository.create(body);
    if (body.role_id?.length) {
      const roles = await Promise.all(
        body.role_id.map((roleId) => this.roleService.findOneById(roleId)),
      );
      newUser.roles = roles;
    }
    await this.userRepository.save(newUser);
    newUser.profileImg =
      this.configService.get('HOST_ADMIN') +
      'profileImgs/' +
      newUser.profileImg;
    return newUser;
  }

  async saveUser(newUser: User): Promise<User> {
    return await this.userRepository.save(newUser);
  }

  async findAll(pagination: PaginationDto, { status }: StatusQueryDto) {
    const { limit, offset } = pagination;
    const [users, total] = await this.userRepository.findAndCount({
      where: { status },
      take: limit,
      skip: offset,
      select: { ...userColumns, authProvider: true },
    });
    const usersP = users.map((user) => {
      if (user.authProvider !== String(Providers.GOOGLE)) {
        user.profileImg =
          this.configService.get('HOST_ADMIN') +
          'profileImgs/' +
          user.profileImg;
      }
      return user;
    });
    return {
      limit,
      offset,
      total,
      users: usersP,
    };
  }

  async findOneById(id: string) {
    const user = await this.userRepository.findOne({
      where: { _id: id },
      relations: { waterMeters: true },
      select: userColumns,
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.profileImg =
      this.configService.get('HOST_ADMIN') + 'profileImgs/' + user.profileImg;
    return user;
  }

  async findOneByIdAndTokens(id: string, tokens: [string, string]) {
    const [accessToken, refreshToken] = tokens;
    const user = await this.findOneByIdRaw(id);
    if (!user) throw new UnauthorizedException(`Token invalido`);
    const hasAccess = user.accessToken?.includes(accessToken);
    const hasRefresh = user.refreshToken?.includes(refreshToken);

    if (!hasAccess || !hasRefresh)
      throw new UnauthorizedException(`Tokens inválidos`);
    return user;
  }

  async findOneByIdAndAccessToken(id: string, accessToken: string) {
    const user = await this.findOneByIdRaw(id);
    if (!user) throw new UnauthorizedException(`Token invalido`);
    const hasAccess = user.accessToken?.includes(accessToken);
    if (!hasAccess) throw new UnauthorizedException(`Token inválido`);
    return user;
  }

  async findOneByIdRaw(id: string) {
    return await this.userRepository.findOne({
      where: { _id: id },
      // select: userColumns,
    });
  }

  async findOneUserByCIRaw(ci: number) {
    return await this.userRepository.findOne({ where: { ci } });
  }

  async findOneUserByCIStatusTrueRaw(ci: number) {
    return await this.userRepository.findOne({ where: { ci, status: true } });
  }

  async findOneByPhoneRaw(phone: string) {
    return await this.userRepository.findOne({
      where: { phoneNumber: phone },
      // select: userColumns,
    });
  }

  async findOneByPhone(phone: string) {
    const user = await this.userRepository.findOne({
      where: { phoneNumber: phone },
      select: userColumns,
    });
    if (!user) throw new NotFoundException(`Phone ${phone} not found`);
    user.profileImg =
      this.configService.get('HOST_ADMIN') + 'profileImgs/' + user.profileImg;
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: userColumns,
    });
    if (!user) throw new NotFoundException(`Email ${email} not found`);
    user.profileImg =
      this.configService.get('HOST_ADMIN') + 'profileImgs/' + user.profileImg;
    return user;
  }

  async findOneByEmailRaw(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      // select: userColumns,
    });
  }

  async authfindByCIRaw(ci: number) {
    return await this.userRepository.findOne({
      where: { ci, status: true },
    });
  }

  async findByEmailRaw(email: string) {
    return await this.userRepository.findOne({
      where: { email, status: true },
    });
  }

  async getMeById(_id: string) {
    const user = await this.userRepository.findOne({
      where: { _id },
      select: {
        ...userColumns,
        accessToken: true,
        refreshToken: true,
        authProvider: true,
        boardDirector: true,
      },
    });
    return user;
  }

  // =============== UPDATE ME BY ID ===============
  async updateMe(_id: string, body: UpdateUserDto, filename: string) {
    const user = await this.findOneById(_id);
    if (body.email === user.email) {
      const userEmail = await this.findOneByEmailRaw(body.email);
      if (userEmail && userEmail._id !== _id)
        throw new ConflictException(
          `El email ${body.email} ya esta registrado  jjj`,
        );
    }
    const userPhone = await this.userRepository.findOne({
      where: { _id, phoneNumber: body.phoneNumber },
    });
    // Si el celular es de el mismo
    // Reemplaza o cambia si aun no esta registrado
    if (userPhone) {
      user.profileImg = filename;
      Object.assign(user, body);
      const userUpdate = await this.userRepository.save(user);
      return userUpdate;
    }

    // Si el celular esta registrado con otro usuario
    throw new ConflictException(
      `El celular ${body.phoneNumber} ya esta registrado`,
    );
  }

  // =============== UPDATE A USER BY ID ===============
  async update(userId: string, dto: UpdateUserDto) {
    const user = await this.findOneByIdRaw(userId); // 1 query necesaria
    if (!user) throw new NotFoundException(`Usuario no encontrado`);
    await this.handleRoles(user, dto);
    this.assignSafeFields(user, dto);

    if (dto.password)
      user.password = await this.hashService.encrypt(dto.password);

    const normalized = [
      ...new Set(dto.meter_numbers ? dto.meter_numbers.map(Number) : []),
    ];

    try {
      await this.userRepository.save(user);
      await this.validateAndCreate(user, normalized);
    } catch (e) {
      handlePostgresDuplicateError(e);
    }
    return this.findOneById(userId);
  }

  // MANEJADOR ROLES, SI ES ADMIN VERIFICAR EMAIL Y PASSWORD
  private async handleRoles(user: User, dto: UpdateUserDto) {
    if (!dto.role_id?.length) return;

    const previous = user.roles
      .map((r) => r._id)
      .sort()
      .join(',');

    const roles = await this.roleService.findRolesInRaw(dto.role_id);
    // Verificar que tenga email y password si el rol es ADMIN
    if (roles.some((r) => r.name === 'ADMIN')) {
      if (!dto.email) //  || !dto.password
        throw new BadRequestException('Email es requerido');
    }
    user.roles = roles;

    const current = roles
      .map((r) => r._id)
      .sort()
      .join(',');

    if (previous !== current) {
      user.accessToken = [];
      user.refreshToken = [];
    }
  }

  async validateAndCreate(userId: User, meters: number[]) {
    const normalized = [...new Set(meters.map(Number))];
    const existing = await this.waterService.findByMeterNumbers(normalized);

    if (existing.length) {
      throw new ConflictException(
        `Medidores ya registrados: ${existing
          .map((m) => m.meter_number)
          .join(', ')}`,
      );
    }

    await this.waterService.createManyMeters(userId, normalized);
  }

  private assignSafeFields(user: User, dto: UpdateUserDto) {
    const { password, role_id, meter_numbers, profileImg, ...safe } = dto;
    Object.assign(user, safe);
  }

  // =============== REMOVE A USER BY ID ===============
  async remove(_id: string) {
    const user = await this.findOneByIdRaw(_id);
    if (!user) throw new NotFoundException(`User ${_id} not found`);
    deleteFile(profileImgFilePath(), user.profileImg);
    return await this.userRepository.delete(_id);
  }

  // =========  UPDATE REFRESH TOKEN USER | ADMIN ========
  async updateRefreshToken(_id: string, token: string) {
    const newUser = await this.findOneByIdRaw(_id);
    if (!newUser) throw new NotFoundException(`User ${_id} not found`);
    // If refreshToken is null, then save by first time
    newUser.refreshToken?.push(token) || (newUser.refreshToken = [token]);
    return await this.userRepository.save(newUser);
  }
  // =========  UPDATE ACCESS TOKEN USER | ADMIN ========
  async updateAccessToken(_id: string, token: string) {
    const newUser = await this.findOneByIdRaw(_id);
    if (!newUser) throw new NotFoundException(`User ${_id} not found`);
    // If refreshToken is null, then save by first time
    newUser.accessToken?.push(token) || (newUser.accessToken = [token]);
    return await this.userRepository.save(newUser);
  }
}

export const userColumns = {
  _id: true,
  ci: true,
  name: true,
  surname: true,
  email: true,
  birthDate: true,
  emailVerified: true,
  phoneNumber: true,
  phoneVerified: true,
  profileImg: true,
  roles: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  status: true,
};
