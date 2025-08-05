import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

import { ConfigService } from '@nestjs/config';
import { deleteFile } from 'src/helpers/delete.file';
import { profileImgFilePath } from 'src/helpers/file.filter';
import { CreateGoogleUserDto } from 'src/router/auth/dto/create-auth.dto';
import { HashService } from 'src/router/auth/hashing/password.hash';
import { Role } from 'src/router/roles/entities/role.entity';
import { CreateUserDto } from 'src/router/user/dto/create-user.dto';
import { Providers, User } from 'src/router/user/entities/user.entity';
import { CreateWaterMeterDto } from 'src/router/water-meters/dto/create-water-meter.dto';
import { WaterMetersService } from 'src/router/water-meters/water-meters.service';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { StatusQueryDto } from 'src/shared/dto/queries.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly roleService: RolesService,
    private readonly waterService: WaterMetersService,
    private readonly hashService: HashService,
  ) {}

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
    const newUser = this.userRepository.create(body);
    const roles = await Promise.all(
      body.role_id.map((roleId) => this.roleService.findOneById(roleId)),
    );
    newUser.roles = roles;
    if (filename) newUser.profileImg = filename;
    await this.userRepository.save(newUser);
    // Si hay numero de medidor registrar
    if (body.meter_number) {
      const body2: CreateWaterMeterDto = {
        ci: newUser.ci,
        name: newUser.name,
        surname: newUser.surname,
        meter_number: body.meter_number,
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
    const roles = await Promise.all(
      body.role_id.map((roleId) => this.roleService.findOneById(roleId)),
    );
    newUser.roles = roles;
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
      select: userColumns,
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    user.profileImg =
      this.configService.get('HOST_ADMIN') + 'profileImgs/' + user.profileImg;
    return user;
  }

  async findOneByIdAndTokens(id: string, tokens: [string, string]) {
    const user = await this.userRepository.findOne({
      where: {
        _id: id,
        accessToken: Like(`%${tokens[0]}%`),
        refreshToken: Like(`%${tokens[1]}%`),
      },
      // select: userColumns,
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findOneByIdAndAccessToken(id: string, accessToken: string) {
    const user = await this.userRepository.findOne({
      where: {
        _id: id,
        accessToken: Like(`%${accessToken}%`),
      },
      // select: userColumns,
    });
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
  async update(_id: string, body: UpdateUserDto) {
    const user = await this.findOneByIdRaw(_id);
    if (!user) throw new NotFoundException(`User ${_id} not found`);

    // Validar email si se está cambiando
    if (body.email && body.email !== user.email) {
      const userEmail = await this.userRepository.findOne({
        where: { email: body.email },
      });
      console.log('🚀 ~ UserService ~ update ~ userEmail:', userEmail);
      if (userEmail && userEmail._id !== _id)
        throw new ConflictException(
          `El email ${body.email} ya esta registrado`,
        );
    }

    // Validar teléfono si se está cambiando
    if (body.phoneNumber && body.phoneNumber !== user.phoneNumber) {
      const userPhone = await this.userRepository.findOne({
        where: { phoneNumber: body.phoneNumber },
      });
      if (userPhone && userPhone._id !== _id)
        throw new ConflictException(
          `El celular ${body.phoneNumber} ya esta registrado`,
        );
    }

    // Validar roles y si es ADMIN debe tener email
    if (body.role_id) {
      const roles: Role[] = [];
      let isAdmin = false;
      for (const roleId of body.role_id) {
        const role = await this.roleService.findOneById(roleId);
        roles.push(role);
        if (role.name === this.configService.get('ADMIN_ROLE_NAME'))
          isAdmin = true;
      }
      user.roles = roles;
      if (isAdmin && !(body.email || user.email)) {
        throw new ConflictException('Un usuario ADMIN debe tener un email.');
      }
    }

    Object.assign(user, body);

    if (body.password)
      user.password = await this.hashService.encrypt(body.password);

    const userUpdate = await this.userRepository.save(user);
    user.profileImg =
      this.configService.get('HOST_ADMIN') + 'profileImgs/' + user.profileImg;
    return userUpdate;
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
    const newUser = await this.userRepository.findOne({ where: { _id } });
    if (!newUser) throw new NotFoundException(`User ${_id} not found`);
    // If refreshToken is null, then save by first time
    newUser.refreshToken?.push(token) || (newUser.refreshToken = [token]);
    return await this.userRepository.save(newUser);
  }
  // =========  UPDATE ACCESS TOKEN USER | ADMIN ========
  async updateAccessToken(_id: string, token: string) {
    const newUser = await this.userRepository.findOne({ where: { _id } });
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
