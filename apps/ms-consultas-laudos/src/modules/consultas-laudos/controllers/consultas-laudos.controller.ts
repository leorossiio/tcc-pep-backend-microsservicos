import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConsultasLaudosService } from '../services/consultas-laudos.service';
import { CreateConsultaLaudoDto } from '../dto/create-consulta-laudo.dto';
import { UpdateConsultaLaudoDto } from '../dto/update-consulta-laudo.dto';

@ApiTags('Consultas e Laudos')
@Controller('consultas-laudos')
export class ConsultasLaudosController {
  constructor(private readonly consultasLaudosService: ConsultasLaudosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo registro de consulta, triagem ou laudo' })
  @ApiResponse({ status: 201, description: 'Registro criado com sucesso.' })
  create(@Body() createConsultaLaudoDto: CreateConsultaLaudoDto) {
    return this.consultasLaudosService.create(createConsultaLaudoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os registros' })
  findAll() {
    return this.consultasLaudosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um registro específico pelo ID (MongoDB)' })
  findOne(@Param('id') id: string) {
    return this.consultasLaudosService.findOne(id);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Listar todo o histórico de consultas/laudos de um paciente específico' })
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.consultasLaudosService.findByPaciente(pacienteId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um registro existente' })
  update(@Param('id') id: string, @Body() updateConsultaLaudoDto: UpdateConsultaLaudoDto) {
    return this.consultasLaudosService.update(id, updateConsultaLaudoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um registro (Adequação LGPD / Anonimização)' })
  remove(@Param('id') id: string) {
    return this.consultasLaudosService.remove(id);
  }
}