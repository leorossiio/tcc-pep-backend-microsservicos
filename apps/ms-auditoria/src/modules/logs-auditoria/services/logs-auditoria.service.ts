import { Injectable } from '@nestjs/common';
import { LogsAuditoriaRepository } from '../repositories/logs-auditoria.repository';
import { CreateLogAuditoriaDto } from '../dto/create-log-auditoria.dto';

@Injectable()
export class LogsAuditoriaService {
  constructor(private readonly logsAuditoriaRepository: LogsAuditoriaRepository) {}

  async create(dto: CreateLogAuditoriaDto) {
    return this.logsAuditoriaRepository.create(dto);
  }

  async findAll() {
    return this.logsAuditoriaRepository.findAll();
  }
}