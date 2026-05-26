// apps/ms-medicos/src/modules/medicos/services/medicos.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { MedicosRepository } from '../repositories/medicos.repository';
import { CreateMedicoDto } from '../dto/create-medico.dto';
import { UpdateMedicoDto } from '../dto/update-medico.dto';
import { Medico } from '../entities/medico.entity';

@Injectable()
export class MedicosService {
  private readonly urlAuditoria = process.env.URL_AUDITORIA || 'http://localhost:3004/auditoria';

  constructor(
    private readonly medicosRepository: MedicosRepository,
    private readonly httpService: HttpService, // Substitui os antigos acoplamentos
  ) {}

  // Centraliza o disparo do Log via Rede
  private dispararAuditoria(acao: string, entidadeId: string) {
    const payload = {
      atendimentoId: null,
      acaoRealizada: acao,
      ipOrigem: null, // Monolito não rastreava IP em médicos, manteremos o contrato
      entidadeAfetada: 'Medico',
      entidadeId: entidadeId,
      usuarioResponsavel: 'sistema',
    };

    this.httpService.post(this.urlAuditoria, payload).subscribe({
      error: (err) => console.warn('[ms-medicos] Falha ao comunicar com Auditoria:', err.message),
    });
  }

  async create(dto: CreateMedicoDto): Promise<Medico> {
    const existing = await this.medicosRepository.findByCrm(dto.crm);
    if (existing) {
      throw new ConflictException('Médico com este CRM já cadastrado');
    }

    const medico = new Medico();
    medico.nomeCompleto = dto.nomeCompleto;
    medico.crm = dto.crm;
    medico.especialidade = dto.especialidade;
    medico.ativo = dto.ativo ?? true;

    const saved = await this.medicosRepository.save(medico);

    // Agora o cadastro do médico também é auditado!
    this.dispararAuditoria('Médico cadastrado no sistema', saved.id);

    return saved;
  }

  findAll(): Promise<Medico[]> {
    return this.medicosRepository.findAll();
  }

  findAtivos(): Promise<Medico[]> {
    return this.medicosRepository.findAtivos();
  }

  async findOne(id: string): Promise<Medico> {
    const medico = await this.medicosRepository.findOne(id);
    if (!medico) {
      throw new NotFoundException(`Médico #${id} não encontrado`);
    }
    return medico;
  }

  async update(id: string, dto: UpdateMedicoDto): Promise<Medico> {
    const medico = await this.findOne(id);

    if (dto.crm && dto.crm !== medico.crm) {
      const crmEmUso = await this.medicosRepository.findByCrm(dto.crm);
      if (crmEmUso) {
        throw new ConflictException('Este CRM já está em uso por outro médico');
      }
      medico.crm = dto.crm;
    }

    if (dto.nomeCompleto) medico.nomeCompleto = dto.nomeCompleto;
    if (dto.especialidade) medico.especialidade = dto.especialidade;
    if (dto.ativo !== undefined) medico.ativo = dto.ativo;

    const saved = await this.medicosRepository.save(medico);

    const campos = Object.keys(dto).join(', ');
    this.dispararAuditoria(`Dados do médico atualizados — campos: ${campos}`, saved.id);

    return saved;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.medicosRepository.remove(id);

    this.dispararAuditoria('Médico removido do sistema', id);
  }
}