import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HistoricoClinicosRepository } from '../repositories/historico-clinicos.repository';
import { CreateHistoricoClinicoDto } from '../dto/create-historico-clinico.dto';
import { UpdateHistoricoClinicoDto } from '../dto/update-historico-clinico.dto';
import { hashDocument } from '@pep/common/utils/crypto.util';

@Injectable()
export class HistoricoClinicosService {
  constructor(private readonly historicoClinicosRepository: HistoricoClinicosRepository) {}

  async create(createHistoricoClinicoDto: CreateHistoricoClinicoDto) {
    if (!createHistoricoClinicoDto.hash_integridade) {
      // 1. Cria uma cópia rasa dos dados do DTO
      const dadosParaAssinar = { ...createHistoricoClinicoDto };
      
      // 2. Gera o hash SHA-256 real baseado no conteúdo e atribui ao DTO
      createHistoricoClinicoDto.hash_integridade = hashDocument(dadosParaAssinar);
    }

    return this.historicoClinicosRepository.create(createHistoricoClinicoDto);
  }

  /**
   * Passo 2 do dual-write da triagem: garante o historico do paciente.
   *
   * Existe para espelhar o criarOuObter do monolito, onde esta chamada e um
   * metodo em processo. Aqui ela custa um salto HTTP vindo do ms-atendimentos —
   * e esse custo e justamente parte do que o experimento mede.
   */
  async criarOuObter(createHistoricoClinicoDto: CreateHistoricoClinicoDto) {
    try {
      if (!createHistoricoClinicoDto.hash_integridade) {
        createHistoricoClinicoDto.hash_integridade = hashDocument({
          ...createHistoricoClinicoDto,
        });
      }
      return await this.historicoClinicosRepository.upsertByPacienteId(
        createHistoricoClinicoDto,
      );
    } catch {
      throw new InternalServerErrorException(
        'Falha ao criar historico clinico no MongoDB',
      );
    }
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