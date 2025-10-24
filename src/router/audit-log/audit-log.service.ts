import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
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

  findAll() {
    return `This action returns all auditLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auditLog`;
  }

  update(id: number, updateAuditLogDto: UpdateAuditLogDto) {
    return `This action updates a #${id} auditLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditLog`;
  }
}
