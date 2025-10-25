import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogService.create(createAuditLogDto);
  }

  @Get()
  @ApiProperty({ title: 'Audit logs', type: [AuditLog] })
  findAll(@Query() pagination: PaginationDto) {
    return this.auditLogService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditLogService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditLogService.remove(+id);
  }
}
