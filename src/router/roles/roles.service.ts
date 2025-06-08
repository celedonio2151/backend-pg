import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

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
    const result = await this.roleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
  }
}
