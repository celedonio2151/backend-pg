import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { In, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // ========== CREA ROLES POR DEFECTO ==========
  async onApplicationBootstrap() {
    const defaultRoles: CreateRoleDto[] = [
      { name: 'ADMIN', description: 'Administrador del sistema' },
      { name: 'USER', description: 'Usuario registrado por defecto' },
    ];
    for (const roleData of defaultRoles) {
      const exists = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });
      if (!exists)
        await this.roleRepository.save(this.roleRepository.create(roleData));
    }
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (role) throw new ConflictException(`Role is already registered `);
    const newRole = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(newRole);
  }

  async findAll(pagination: PaginationDto) {
    const { limit, offset } = pagination;
    const [roles, total] = await this.roleRepository.findAndCount({
      take: limit,
      skip: offset,
    });
    return { limit, offset, total, roles };
  }

  async findOneById(_id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { _id } });
    if (!role) {
      throw new NotFoundException(`Role with id ${_id} not found`);
    }
    return role;
  }

  async findOneByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException(`Rol ${name} no encontrado`);
    }
    return role;
  }

  async findOneByNameRaw(name: string) {
    return await this.roleRepository.findOne({ where: { name } });
  }

  async findRolesInRaw(_ids: string[]) {
    return await this.roleRepository.findBy({
      _id: In(_ids),
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOneById(id);
    const name = await this.roleRepository.findOne({
      where: { name: updateRoleDto.name },
    });
    if (name && name._id !== id) {
      throw new ConflictException(
        `Rol con el nombre ${updateRoleDto.name} ya existe`,
      );
    }
    const updated = Object.assign(role, updateRoleDto);
    return this.roleRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOneById(id);
    if (role.name === 'USER' || role.name === 'ADMIN') {
      throw new BadRequestException(`No se puede borrar el rol ${role.name}`);
    }
    const result = await this.roleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
  }
}
