// apps/ms-medicos/src/modules/medicos/controllers/medicos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MedicosService } from '../services/medicos.service';
import { CreateMedicoDto } from '../dto/create-medico.dto';
import { UpdateMedicoDto } from '../dto/update-medico.dto';

@ApiTags('Médicos')
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo médico' })
  @ApiResponse({ status: 201, description: 'Médico cadastrado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Conflito (CRM já existente).' })
  create(@Body() createMedicoDto: CreateMedicoDto) {
    return this.medicosService.create(createMedicoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os médicos' })
  findAll() {
    return this.medicosService.findAll();
  }

  @Get('ativos')
  @ApiOperation({ summary: 'Listar apenas médicos ativos' })
  findAtivos() {
    return this.medicosService.findAtivos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar médico específico' })
  findOne(@Param('id') id: string) {
    return this.medicosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados do médico' })
  update(@Param('id') id: string, @Body() updateMedicoDto: UpdateMedicoDto) {
    return this.medicosService.update(id, updateMedicoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover médico' })
  remove(@Param('id') id: string) {
    return this.medicosService.remove(id);
  }
}