import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAuditoria } from '../entities/log-auditoria.entity';
import { CreateLogAuditoriaDto } from '../dto/create-log-auditoria.dto';

@Injectable()
export class LogsAuditoriaRepository {
  constructor(
    @InjectRepository(LogAuditoria)
    private readonly repo: Repository<LogAuditoria>,
  ) {}

  async create(dto: CreateLogAuditoriaDto): Promise<LogAuditoria> {
    const log = this.repo.create(dto);
    return this.repo.save(log);
  }

  async findAll(): Promise<LogAuditoria[]> {
    return this.repo.find({ order: { dataHora: 'DESC' } });
  }
}