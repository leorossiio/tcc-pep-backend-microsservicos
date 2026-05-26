import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { LogsAuditoriaService } from '../services/logs-auditoria.service';
import { CreateLogAuditoriaDto } from '../dto/create-log-auditoria.dto';

@Controller('auditoria')
export class LogsAuditoriaController {
  constructor(private readonly logsAuditoriaService: LogsAuditoriaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateLogAuditoriaDto) {
    return this.logsAuditoriaService.create(dto);
  }

  @Get()
  findAll() {
    return this.logsAuditoriaService.findAll();
  }
}