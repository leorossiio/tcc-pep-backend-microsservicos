import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConsultasLaudosRepository } from '../repositories/consultas-laudos.repository';
import { CreateConsultaLaudoDto } from '../dto/create-consulta-laudo.dto';
import { UpdateConsultaLaudoDto } from '../dto/update-consulta-laudo.dto';
import { hashDocument } from '../../../../../../libs/common/src/utils/crypto.util';

@Injectable()
export class ConsultasLaudosService {
  private readonly urlAuditoria =
    process.env.URL_AUDITORIA || 'http://ms-auditoria:3004/auditoria';

  constructor(
    private readonly consultasLaudosRepository: ConsultasLaudosRepository,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Auditoria do registro clinico — fire-and-forget, como no monolito.
   *
   * Existe por paridade experimental: o create() do monolito grava um log de
   * auditoria do ConsultaLaudo, e sem este disparo o MS faria uma escrita a
   * menos por triagem. Aqui o custo e um salto HTTP a mais, que e justamente a
   * diferenca arquitetural que o trabalho mede.
   */
  private dispararAuditoria(dto: CreateConsultaLaudoDto, documentoId: string) {
    this.httpService
      .post(this.urlAuditoria, {
        atendimentoId: dto.atendimento_id,
        acaoRealizada: `${dto.tipo_registro} registrado pelo médico ${dto.medico_id}`,
        ipOrigem: null,
        entidadeAfetada: 'ConsultaLaudo',
        entidadeId: documentoId,
        usuarioResponsavel: dto.medico_id,
      })
      .subscribe({
        error: (err) =>
          console.warn(
            '[ms-consultas-laudos] Falha ao comunicar com Auditoria:',
            err.message,
          ),
      });
  }

  async create(createConsultaLaudoDto: CreateConsultaLaudoDto) {
    if (!createConsultaLaudoDto.hash_integridade) {
      // 1. Cria uma cópia rasa dos dados do DTO
      const dadosParaAssinar = { ...createConsultaLaudoDto };
      
      // 2. Gera o hash SHA-256 real baseado no conteúdo e atribui ao DTO
      createConsultaLaudoDto.hash_integridade = hashDocument(dadosParaAssinar);
    }

    const documento = await this.consultasLaudosRepository.create(
      createConsultaLaudoDto,
    );
    this.dispararAuditoria(createConsultaLaudoDto, String(documento._id));
    return documento;
  }

  async findAll() {
    return this.consultasLaudosRepository.findAll();
  }

  async findOne(id: string) {
    const consultaLaudo = await this.consultasLaudosRepository.findById(id);
    if (!consultaLaudo) {
      throw new NotFoundException(`Registro de consulta/laudo com ID ${id} não encontrado.`);
    }
    return consultaLaudo;
  }

  async findByPaciente(pacienteId: string) {
    return this.consultasLaudosRepository.findByPacienteId(pacienteId);
  }

  async update(id: string, updateConsultaLaudoDto: UpdateConsultaLaudoDto) {
    const atualizado = await this.consultasLaudosRepository.update(id, updateConsultaLaudoDto);
    if (!atualizado) {
      throw new NotFoundException(`Registro de consulta/laudo com ID ${id} não encontrado para atualização.`);
    }
    return atualizado;
  }

  async remove(id: string) {
    const deletado = await this.consultasLaudosRepository.remove(id);
    if (!deletado) {
      throw new NotFoundException(`Registro de consulta/laudo com ID ${id} não encontrado para exclusão.`);
    }
    return { message: 'Registro excluído com sucesso' };
  }
}