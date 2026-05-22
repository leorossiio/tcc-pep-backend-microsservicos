import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Request } from 'express';
import { hashCpf, encryptNome, decryptNome } from '@pep/common';
import { PacientesRepository } from '../repositories/pacientes.repository';
import { CreatePacienteDto } from '../dto/create-paciente.dto';
import { UpdatePacienteDto } from '../dto/update-paciente.dto';
import { Paciente } from '../entities/paciente.entity';

@Injectable()
export class PacientesService {
  constructor(
    private readonly pacientesRepository: PacientesRepository,
  ) {}

  private extractIp(req?: Request): string | null {
    if (!req) return null;
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    }
    return req.socket?.remoteAddress ?? null;
  }

  private decrypt(paciente: Paciente): Paciente {
    try {
      paciente.nomeCompleto = decryptNome(paciente.nomeCompleto);
    } catch {
      // valor já em texto plano (dados anteriores à criptografia)
    }
    return paciente;
  }

  async create(dto: CreatePacienteDto, req?: Request): Promise<Paciente> {
    const cpfHash = hashCpf(dto.cpf);
    const existing = await this.pacientesRepository.findByCpfHash(cpfHash);
    if (existing) {
      throw new ConflictException('Paciente com este CPF já cadastrado');
    }

    const paciente = new Paciente();
    paciente.nomeCompleto     = encryptNome(dto.nomeCompleto);
    paciente.sexo             = dto.sexo;
    paciente.cpfHash          = cpfHash;
    paciente.dataNascimento   = new Date(dto.dataNascimento);
    paciente.telefoneContato  = dto.telefoneContato ?? null;
    paciente.tipagemSanguinea = dto.tipagemSanguinea ?? null;
    paciente.consentimentoLgpd = dto.consentimentoLgpd;

    const saved = await this.pacientesRepository.save(paciente);

    return this.decrypt(saved);
  }

  async findAll(): Promise<Paciente[]> {
    const pacientes = await this.pacientesRepository.findAll();
    return pacientes.map((p) => this.decrypt(p));
  }

  async findOne(id: string): Promise<Paciente> {
    const paciente = await this.pacientesRepository.findOne(id);
    if (!paciente) {
      throw new NotFoundException(`Paciente #${id} não encontrado`);
    }
    return this.decrypt(paciente);
  }

  async update(id: string, dto: UpdatePacienteDto, req?: Request): Promise<Paciente> {
    const paciente = await this.pacientesRepository.findOne(id);
    if (!paciente) {
      throw new NotFoundException(`Paciente #${id} não encontrado`);
    }

    if (dto.cpf)                paciente.cpfHash        = hashCpf(dto.cpf);
    if (dto.nomeCompleto)       paciente.nomeCompleto   = encryptNome(dto.nomeCompleto);
    if (dto.sexo)               paciente.sexo           = dto.sexo;
    if (dto.dataNascimento)     paciente.dataNascimento = new Date(dto.dataNascimento);
    if (dto.telefoneContato !== undefined)  paciente.telefoneContato  = dto.telefoneContato ?? null;
    if (dto.tipagemSanguinea !== undefined) paciente.tipagemSanguinea = dto.tipagemSanguinea ?? null;
    if (dto.consentimentoLgpd !== undefined) paciente.consentimentoLgpd = dto.consentimentoLgpd;

    const saved = await this.pacientesRepository.save(paciente);

    return this.decrypt(saved);
  }

  async remove(id: string, req?: Request): Promise<void> {
    await this.findOne(id);
    await this.pacientesRepository.remove(id);
  }
}