import { Injectable, NotFoundException } from '@nestjs/common';
import { HistoricoClinicosRepository } from '../repositories/historico-clinicos.repository';
import { CreateHistoricoClinicoDto } from '../dto/create-historico-clinico.dto';
import { UpdateHistoricoClinicoDto } from '../dto/update-historico-clinico.dto';

@Injectable()
export class HistoricoClinicosService {
  constructor(private readonly historicoClinicosRepository: HistoricoClinicosRepository) {}

  async create(createHistoricoClinicoDto: CreateHistoricoClinicoDto) {
    // Fallback temporário para integridade LGPD
    if (!createHistoricoClinicoDto.hash_integridade) {
      createHistoricoClinicoDto.hash_integridade = 'hash-temporario-gerado-pelo-backend';
    }

    return this.historicoClinicosRepository.create(createHistoricoClinicoDto);
  }

  async findAll() {
    return this.historicoClinicosRepository.findAll();
  }

  async findOne(id: string) {
    const historico = await this.historicoClinicosRepository.findById(id);
    if (!historico) {
      throw new NotFoundException(`Histórico clínico com ID ${id} não encontrado.`);
    }
    return historico;
  }

  async findByPaciente(pacienteId: string) {
    const historico = await this.historicoClinicosRepository.findByPacienteId(pacienteId);
    if (!historico) {
      throw new NotFoundException(`Histórico clínico do paciente ${pacienteId} não encontrado.`);
    }
    return historico;
  }

  async update(id: string, updateHistoricoClinicoDto: UpdateHistoricoClinicoDto) {
    const atualizado = await this.historicoClinicosRepository.update(id, updateHistoricoClinicoDto);
    if (!atualizado) {
      throw new NotFoundException(`Histórico clínico com ID ${id} não encontrado para atualização.`);
    }
    return atualizado;
  }

  async remove(id: string) {
    const deletado = await this.historicoClinicosRepository.remove(id);
    if (!deletado) {
      throw new NotFoundException(`Histórico clínico com ID ${id} não encontrado para exclusão.`);
    }
    return { message: 'Histórico clínico excluído com sucesso.' };
  }
}