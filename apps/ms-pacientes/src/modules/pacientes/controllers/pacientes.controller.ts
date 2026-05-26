// apps/ms-pacientes/src/modules/pacientes/controllers/pacientes.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PacientesService } from '../services/pacientes.service';
import { CreatePacienteDto } from '../dto/create-paciente.dto';
import { UpdatePacienteDto } from '../dto/update-paciente.dto';

@ApiTags('Pacientes')
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo paciente' })
  @ApiResponse({ status: 201, description: 'Paciente cadastrado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Conflito (CPF já existente).' })
  create(@Body() createPacienteDto: CreatePacienteDto, @Req() req: Request) {
    return this.pacientesService.create(createPacienteDto, req);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pacientes' })
  findAll() {
    return this.pacientesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar paciente específico' })
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados cadastrais' })
  update(@Param('id') id: string, @Body() updatePacienteDto: UpdatePacienteDto, @Req() req: Request) {
    return this.pacientesService.update(id, updatePacienteDto, req);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover paciente' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.pacientesService.remove(id, req);
  }
}