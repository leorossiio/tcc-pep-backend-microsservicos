// apps/ms-pacientes/src/modules/pacientes/services/pacientes.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Request } from 'express';
import { HttpService } from '@nestjs/axios';
import { hashCpf, encryptNome, decryptNome } from '../../../common/utils/crypto.util';
import { PacientesRepository } from '../repositories/pacientes.repository';
import { CreatePacienteDto } from '../dto/create-paciente.dto';
import { UpdatePacienteDto } from '../dto/update-paciente.dto';
import { Paciente } from '../entities/paciente.entity';

@Injectable()
export class PacientesService {
  // A URL do ms-auditoria isolado
  private readonly urlAuditoria = process.env.URL_AUDITORIA || 'http://localhost:3004/auditoria';

  constructor(
    private readonly pacientesRepository: PacientesRepository,
    private readonly httpService: HttpService, // Substitui a injeção do monólito
  ) {}

  private extractIp(req?: Request): string | null {
    if (!req) return null;
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return req.socket?.remoteAddress ?? null;
  }

  private decrypt(paciente: Paciente): Paciente {
    try {
      paciente.nomeCompleto = decryptNome(paciente.nomeCompleto);
    } catch {
      // Ignora se já estiver em texto plano
    }
    return paciente;
  }

  // Novo método que delega o trabalho pela rede
  private dispararAuditoria(acao: string, entidadeId: string, req?: Request) {
    const payload = {
      atendimentoId: null,
      acaoRealizada: acao,
      ipOrigem: this.extractIp(req),
      entidadeAfetada: 'Paciente',
      entidadeId: entidadeId,
      usuarioResponsavel: 'sistema',
    };
    
    // Dispara a requisição de forma assíncrona sem travar o utilizador
    this.httpService.post(this.urlAuditoria, payload).subscribe({
      error: (err) => console.warn('[ms-pacientes] Falha ao comunicar com Auditoria:', err.message),
    });
  }

  async create(dto: CreatePacienteDto, req?: Request): Promise<Paciente> {
    const cpfHash = hashCpf(dto.cpf);
    const existing = await this.pacientesRepository.findByCpfHash(cpfHash);
    if (existing) throw new ConflictException('Paciente com este CPF já cadastrado');

    const paciente = new Paciente();
    paciente.nomeCompleto    = encryptNome(dto.nomeCompleto);
    paciente.sexo            = dto.sexo;
    paciente.cpfHash         = cpfHash;
    paciente.dataNascimento  = new Date(dto.dataNascimento);
    paciente.telefoneContato = dto.telefoneContato ?? null;
    paciente.tipagemSanguinea = dto.tipagemSanguinea ?? null;
    paciente.consentimentoLgpd = dto.consentimentoLgpd;

    const saved = await this.pacientesRepository.save(paciente);

    this.dispararAuditoria('Paciente cadastrado no sistema', saved.id, req);
    return this.decrypt(saved);
  }

  async findAll(): Promise<Paciente[]> {
    const pacientes = await this.pacientesRepository.findAll();
    return pacientes.map((p) => this.decrypt(p));
  }

  async findOne(id: string): Promise<Paciente> {
    const paciente = await this.pacientesRepository.findOne(id);
    if (!paciente) throw new NotFoundException(`Paciente #${id} não encontrado`);
    return this.decrypt(paciente);
  }

  async update(id: string, dto: UpdatePacienteDto, req?: Request): Promise<Paciente> {
    const paciente = await this.findOne(id);

    if (dto.cpf) paciente.cpfHash = hashCpf(dto.cpf);
    if (dto.nomeCompleto) paciente.nomeCompleto = encryptNome(dto.nomeCompleto);
    if (dto.sexo) paciente.sexo = dto.sexo;
    if (dto.dataNascimento) paciente.dataNascimento = new Date(dto.dataNascimento);
    if (dto.telefoneContato !== undefined) paciente.telefoneContato = dto.telefoneContato ?? null;
    if (dto.tipagemSanguinea !== undefined) paciente.tipagemSanguinea = dto.tipagemSanguinea ?? null;
    if (dto.consentimentoLgpd !== undefined) paciente.consentimentoLgpd = dto.consentimentoLgpd;

    const saved = await this.pacientesRepository.save(paciente);

    const campos = Object.keys(dto).join(', ');
    this.dispararAuditoria(`Dados do paciente atualizados — campos: ${campos}`, id, req);

    return this.decrypt(saved);
  }

  async remove(id: string, req?: Request): Promise<void> {
    await this.findOne(id);
    await this.pacientesRepository.remove(id);
    this.dispararAuditoria('Paciente removido do sistema', id, req);
  }
}