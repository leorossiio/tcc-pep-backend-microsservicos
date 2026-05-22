import { Injectable, NotFoundException } from '@nestjs/common';
import { AtendimentosRepository } from '../repositories/atendimentos.repository';
import { CreateAtendimentoDto } from '../dto/create-atendimento.dto';
import { UpdateAtendimentoDto } from '../dto/update-atendimento.dto';

@Injectable()
export class AtendimentosService {
  constructor(private readonly atendimentosRepository: AtendimentosRepository) {}

  async create(dto: CreateAtendimentoDto, req?: any) {
    // 1. Cria a Triagem (Atendimento) no PostgreSQL
    const atendimento = await this.atendimentosRepository.create(dto);

    // TODO (Próximo Passo): Injetar o serviço de LogsAuditoria e gravar o log de criação aqui.
    // TODO (Futuro Poliglota): Disparar evento para o ms-prontuarios gerar o HISTORICO e o documento de TRIAGEM no MongoDB.

    return atendimento;
  }

  async findAll() {
    return this.atendimentosRepository.findAll();
  }

  async findOne(id: string) {
    const atendimento = await this.atendimentosRepository.findOneById(id);
    if (!atendimento) {
      throw new NotFoundException(`Atendimento com ID ${id} não encontrado.`);
    }
    return atendimento;
  }

  async update(id: string, dto: UpdateAtendimentoDto, req?: any) {
    const atendimentoAtualizado = await this.atendimentosRepository.update(id, dto);
    if (!atendimentoAtualizado) {
      throw new NotFoundException(`Atendimento com ID ${id} não encontrado para atualização.`);
    }

    // TODO: Gerar log de auditoria de atualização aqui.

    return atendimentoAtualizado;
  }

  async remove(id: string, req?: any) {
    const atendimento = await this.findOne(id); // Garante que existe antes de deletar
    await this.atendimentosRepository.remove(atendimento.id);

    // TODO: Gerar log de auditoria de remoção aqui.
  }
}