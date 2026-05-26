// apps/ms-atendimentos/src/modules/atendimentos/controllers/atendimentos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AtendimentosService } from '../services/atendimentos.service';
import { CreateAtendimentoDto } from '../dto/create-atendimento.dto';
import { UpdateAtendimentoDto } from '../dto/update-atendimento.dto';

@ApiTags('Atendimentos (Triagem)')
@Controller('atendimentos')
export class AtendimentosController {
  constructor(private readonly atendimentosService: AtendimentosService) {}

  @Post()
  @ApiOperation({ summary: 'Realizar triagem de um paciente' })
  @ApiResponse({ status: 201, description: 'Triagem cadastrada com sucesso.' })
  create(@Body() createAtendimentoDto: CreateAtendimentoDto, @Req() req: Request) {
    return this.atendimentosService.create(createAtendimentoDto, req);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as triagens' })
  findAll() {
    return this.atendimentosService.findAll();
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Listar triagens por Paciente' })
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.atendimentosService.findByPacienteId(pacienteId);
  }

  @Get('medico/:medicoId')
  @ApiOperation({ summary: 'Listar triagens por Médico' })
  findByMedico(@Param('medicoId') medicoId: string) {
    return this.atendimentosService.findComLaudosByMedicoId(medicoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar triagem específica' })
  findOne(@Param('id') id: string) {
    return this.atendimentosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar triagem' })
  update(@Param('id') id: string, @Body() updateAtendimentoDto: UpdateAtendimentoDto, @Req() req: Request) {
    return this.atendimentosService.update(id, updateAtendimentoDto, req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover triagem' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.atendimentosService.remove(id, req);
  }
}