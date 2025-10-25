import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async create(auditData: Partial<AuditLog>) {
    const log = this.auditRepo.create(auditData);
    await this.auditRepo.save(log);
  }

  async findAll(pagination: PaginationDto) {
    const { limit, offset } = pagination;
    const auditLogs = await this.auditRepo.find({ skip: offset, take: limit });
    const total = await this.auditRepo.count();

    return { auditLogs, total };
  }

  findOne(id: number) {
    return `This action returns a #${id} auditLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditLog`;
  }
}
