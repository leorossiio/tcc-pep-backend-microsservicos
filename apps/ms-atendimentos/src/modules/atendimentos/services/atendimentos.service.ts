//Atendimento.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AtendimentosRepository } from '../repositories/atendimentos.repository';
import { CreateAtendimentoDto } from '../dto/create-atendimento.dto';
import { UpdateAtendimentoDto } from '../dto/update-atendimento.dto';
import { Atendimento } from '../entities/atendimento.entity';

@Injectable()
export class AtendimentosService {
  private readonly urlAuditoria = process.env.URL_AUDITORIA || 'http://ms-auditoria:3004/logs-auditoria';
  private readonly urlLaudos = process.env.URL_CONSULTAS_LAUDOS || 'http://ms-consultas-laudos:3005/consultas-laudos';
  private readonly urlHistorico =
    process.env.URL_HISTORICO_CLINICOS ||
    'http://ms-historico-clinicos:3006/historico-clinicos';

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
    const isRemocao = acao.includes('removido');

    const payload = {
      atendimentoId: isRemocao ? null : atendimentoId,
      acaoRealizada: acao,
      ipOrigem: this.extractIp(req),
      entidadeAfetada: 'Atendimento',
      entidadeId: atendimentoId,
      usuarioResponsavel: usuarioId,
    };

    this.httpService.post(this.urlAuditoria, payload).subscribe({
      error: (err) => console.warn('[ms-atendimentos] Falha ao comunicar com Auditoria:', err.message),
    });
  }

  /**
   * Triagem hospitalar — reproduz, passo a passo, o dual-write do monolito
   * (src/modules/atendimentos/services/atendimentos.service.ts no repo do
   * monolito), trocando chamadas de servico em processo por chamadas HTTP entre
   * microsservicos:
   *
   *   1. INSERT do atendimento no PostgreSQL          (local)
   *   2. upsert do historico clinico no MongoDB       -> ms-historico-clinicos
   *   3. INSERT da triagem (ConsultaLaudo) no MongoDB -> ms-consultas-laudos
   *   4. INSERT do log de auditoria                   -> ms-auditoria (fire-and-forget)
   *
   * Os passos 1-3 sao SEQUENCIAIS de proposito: ha dependencia de dados entre
   * eles — o passo 3 precisa do _id devolvido pelo passo 2. Esse custo
   * sequencial, somado aos saltos de rede, e exatamente o objeto de medicao do
   * trabalho. Paraleliza-lo aqui sem fazer o mesmo no monolito compararia
   * implementacoes diferentes, e nao arquiteturas.
   *
   * Assim como no monolito, NAO ha transacao distribuida: se o passo 2 ou 3
   * falhar depois do passo 1, o atendimento fica no PostgreSQL sem contraparte
   * no MongoDB.
   */
  async create(dto: CreateAtendimentoDto, req?: Request) {
    if (!dto.dataHoraEntrada) {
      dto.dataHoraEntrada = new Date().toISOString();
    }

    // --- Passo 1: PostgreSQL (local) ---
    let atendimentoSalvo: Atendimento;
    try {
      atendimentoSalvo = await this.atendimentosRepository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException('Falha ao persistir atendimento no PostgreSQL');
    }

    // --- Passo 2: MongoDB via ms-historico-clinicos (upsert idempotente) ---
    let historicoId: string;
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.urlHistorico}/criar-ou-obter`, {
          paciente_id: dto.pacienteId,
          metadados_lgpd: {
            consentimentoColetado: true,
            dataConsentimento: new Date(),
            finalidadeTratamento:
              'Assistência médica e continuidade do cuidado',
            responsavelTratamento: dto.medicoTriagemId,
            anonimizado: false,
          },
        }),
      );
      historicoId = String(data._id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Falha ao obter historico clinico no ms-historico-clinicos (MongoDB)',
      );
    }

    // --- Passo 3: MongoDB via ms-consultas-laudos (documento de TRIAGEM) ---
    // O DTO do ms-consultas-laudos usa snake_case, ao contrario do monolito.
    try {
      await firstValueFrom(
        this.httpService.post(this.urlLaudos, {
          atendimento_id: atendimentoSalvo.id,
          historico_id: historicoId,
          paciente_id: dto.pacienteId,
          medico_id: dto.medicoTriagemId,
          data_registro: new Date(),
          tipo_registro: 'TRIAGEM',
          descricao_clinica: dto.queixaPrincipal,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Falha ao persistir triagem no ms-consultas-laudos (MongoDB)',
      );
    }

    // --- Passo 4: auditoria (fire-and-forget, nao bloqueia a resposta) ---
    this.dispararAuditoria(
      atendimentoSalvo.id,
      `Triagem criada — risco ${dto.classificacaoRisco} — queixa: ${dto.queixaPrincipal}`,
      dto.medicoTriagemId,
      req,
    );

    return { success: true, atendimentoId: atendimentoSalvo.id, dados: atendimentoSalvo };
  }

  async findAll() {
    return this.atendimentosRepository.findAll();
  }

  async findByPacienteId(pacienteId: string): Promise<Atendimento[]> {
    return this.atendimentosRepository.findByPacienteId(pacienteId);
  }

  async findComLaudosByMedicoId(medicoId: string) {
    const atendimentos = await this.atendimentosRepository.findByMedicoTriagemId(medicoId);
    
    // Join Poliglota Real: Busca os laudos via HTTP para cada atendimento
    const atendimentosComLaudos = await Promise.all(
      atendimentos.map(async (atendimento) => {
        let laudos = [];
        try {
          // Faz o GET na rota do ms-consultas-laudos filtrando pelo atendimentoId
          const response = await firstValueFrom(
            this.httpService.get(`${this.urlLaudos}/atendimento/${atendimento.id}`)
          );
          laudos = response.data;
        } catch (error) {
          // Correção do TypeScript: (error as Error)
          console.warn(`[ms-atendimentos] Aviso: Não foi possível carregar laudos do atendimento ${atendimento.id}:`, (error as Error).message);
        }

        return {
          ...atendimento,
          consultasLaudos: laudos, 
        };
      })
    );

    return atendimentosComLaudos;
  }

  async findByIds(ids: string[]): Promise<Atendimento[]> {
    return this.atendimentosRepository.findByIds(ids);
  }

  async findOne(id: string) {
    const atendimento = await this.atendimentosRepository.findOneById(id);
    if (!atendimento) {
      throw new NotFoundException(`Atendimento com ID "${id}" não encontrado`);
    }
    
    // Join Poliglota Real para um único atendimento
    let laudos = [];
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.urlLaudos}/atendimento/${id}`)
      );
      laudos = response.data;
    } catch (error) {
      // Correção do TypeScript: (error as Error)
      console.warn(`[ms-atendimentos] Aviso: Não foi possível carregar laudos do atendimento ${id}:`, (error as Error).message);
    }

    return { ...atendimento, consultasLaudos: laudos };
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