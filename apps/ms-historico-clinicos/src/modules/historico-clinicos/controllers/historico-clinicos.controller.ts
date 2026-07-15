import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HistoricoClinicosService } from '../services/historico-clinicos.service';
import { CreateHistoricoClinicoDto } from '../dto/create-historico-clinico.dto';
import { UpdateHistoricoClinicoDto } from '../dto/update-historico-clinico.dto';

@ApiTags('Histórico Clínico')
@Controller('historico-clinicos')
export class HistoricoClinicosController {
  constructor(private readonly historicoClinicosService: HistoricoClinicosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo histórico clínico para um paciente' })
  @ApiResponse({ status: 201, description: 'Histórico criado com sucesso.' })
  create(@Body() createHistoricoClinicoDto: CreateHistoricoClinicoDto) {
    return this.historicoClinicosService.create(createHistoricoClinicoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os históricos clínicos' })
  findAll() {
    return this.historicoClinicosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um histórico específico pelo ID (MongoDB)' })
  findOne(@Param('id') id: string) {
    return this.historicoClinicosService.findOne(id);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Buscar o histórico clínico pelo UUID do paciente (PostgreSQL)' })
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.historicoClinicosService.findByPaciente(pacienteId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um histórico clínico existente' })
  update(@Param('id') id: string, @Body() updateHistoricoClinicoDto: UpdateHistoricoClinicoDto) {
    return this.historicoClinicosService.update(id, updateHistoricoClinicoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um histórico clínico (Adequação LGPD / Anonimização)' })
  remove(@Param('id') id: string) {
    return this.historicoClinicosService.remove(id);
  }
}