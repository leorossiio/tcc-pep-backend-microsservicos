// apps/ms-auditoria/src/modules/logs-auditoria/controllers/logs-auditoria.controller.ts
import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LogsAuditoriaService } from '../services/logs-auditoria.service';
import { CreateLogAuditoriaDto } from '../dto/create-log-auditoria.dto';

@ApiTags('Auditoria (Logs Internos)')
@Controller('auditoria')
export class LogsAuditoriaController {
  constructor(private readonly logsAuditoriaService: LogsAuditoriaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar um novo log de auditoria' })
  @ApiResponse({ status: 201, description: 'Log registrado com sucesso.' })
  create(@Body() dto: CreateLogAuditoriaDto) {
    return this.logsAuditoriaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os logs de auditoria' })
  findAll() {
    return this.logsAuditoriaService.findAll();
  }
}