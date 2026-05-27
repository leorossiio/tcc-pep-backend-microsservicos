// apps/ms-atendimentos/src/modules/atendimentos/services/atendimentos.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';
import { HttpService } from '@nestjs/axios';
import { AtendimentosRepository } from '../repositories/atendimentos.repository';
import { CreateAtendimentoDto } from '../dto/create-atendimento.dto';
import { UpdateAtendimentoDto } from '../dto/update-atendimento.dto';
import { Atendimento } from '../entities/atendimento.entity';

@Injectable()
export class AtendimentosService {
  private readonly urlAuditoria = process.env.URL_AUDITORIA || 'http://localhost:3004/auditoria';

  constructor(
    private readonly atendimentosRepository: AtendimentosRepository,
    private readonly httpService: HttpService,
  ) {}

  private extractIp(req?: Request): string | null {
    if (!req) return null;
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return req.socket?.remoteAddress ?? null;
  }

  // Disparo assíncrono para ms-auditoria
  private dispararAuditoria(atendimentoId: string, acao: string, usuarioId: string | null, req?: Request) {
    // Se a ação for de remoção, enviamos null para a coluna de Foreign Key (atendimentoId),
    // pois o registro já foi deletado do banco e o PostgreSQL bloquearia a inserção.
    const isRemocao = acao.includes('removido');

    const payload = {
      atendimentoId: isRemocao ? null : atendimentoId, // O "Hack" elegante para evitar o erro de FK
      acaoRealizada: acao,
      ipOrigem: this.extractIp(req),
      entidadeAfetada: 'Atendimento',
      entidadeId: atendimentoId, // O ID continua salvo aqui para o histórico (em formato de texto livre)
      usuarioResponsavel: usuarioId,
    };

    this.httpService.post(this.urlAuditoria, payload).subscribe({
      error: (err) => console.warn('[ms-atendimentos] Falha ao comunicar com Auditoria:', err.message),
    });
  }

  async create(dto: CreateAtendimentoDto, req?: Request) {
    let atendimentoSalvo: Atendimento;
    try {
      atendimentoSalvo = await this.atendimentosRepository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException('Falha ao persistir atendimento no PostgreSQL');
    }

    // Na POC 1 (TCC 1), removemos a criação sincrona do Histórico e Triagem no MongoDB.
    // O foco agora é validar a arquitetura distribuída.

    this.dispararAuditoria(
      atendimentoSalvo.id,
      `Triagem criada — risco ${dto.classificacaoRisco} — queixa: ${dto.queixaPrincipal}`,
      dto.medicoTriagemId,
      req,
    );

    // O JSON de retorno mantém exatamente o mesmo formato!
    return { success: true, atendimentoId: atendimentoSalvo.id };
  }

  async findAll() {
    return this.atendimentosRepository.findAll();
  }

  async findByPacienteId(pacienteId: string): Promise<Atendimento[]> {
    return this.atendimentosRepository.findByPacienteId(pacienteId);
  }

  async findComLaudosByMedicoId(medicoId: string) {
    const atendimentos = await this.atendimentosRepository.findByMedicoTriagemId(medicoId);
    // Retorna array vazio em consultasLaudos para não quebrar o front-end
    return atendimentos.map((a) => ({
      ...a,
      consultasLaudos: [], 
    }));
  }

  async findByIds(ids: string[]): Promise<Atendimento[]> {
    return this.atendimentosRepository.findByIds(ids);
  }

  async findOne(id: string) {
    const atendimento = await this.atendimentosRepository.findOneById(id);
    if (!atendimento) {
      throw new NotFoundException(`Atendimento com ID "${id}" não encontrado`);
    }
    // Fake join poliglota para manter o contrato de API igual ao Monolito
    return { ...atendimento, consultasLaudos: [] };
  }

  async update(id: string, dto: UpdateAtendimentoDto, req?: Request) {
    const atendimento = await this.atendimentosRepository.findOneById(id);
    if (!atendimento) {
      throw new NotFoundException(`Atendimento com ID "${id}" não encontrado`);
    }

    const atualizado = await this.atendimentosRepository.update(id, dto);

    const campos = Object.keys(dto).join(', ');
    this.dispararAuditoria(id, `Atendimento atualizado — campos: ${campos}`, null, req);

    return atualizado;
  }

  async remove(id: string, req?: Request) {
    const atendimento = await this.atendimentosRepository.findOneById(id);
    if (!atendimento) {
      throw new NotFoundException(`Atendimento com ID "${id}" não encontrado`);
    }

    await this.atendimentosRepository.remove(id);
    this.dispararAuditoria(id, 'Atendimento removido', null, req);

    return { success: true, removed: id };
  }
}