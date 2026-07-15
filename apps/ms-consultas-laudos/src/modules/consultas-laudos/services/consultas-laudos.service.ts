import { Injectable, NotFoundException } from '@nestjs/common';
import { ConsultasLaudosRepository } from '../repositories/consultas-laudos.repository';
import { CreateConsultaLaudoDto } from '../dto/create-consulta-laudo.dto';
import { UpdateConsultaLaudoDto } from '../dto/update-consulta-laudo.dto';
// import { CryptoUtil } from '@pep/common'; // Descomente quando integrar a sua lib

@Injectable()
export class ConsultasLaudosService {
  constructor(private readonly consultasLaudosRepository: ConsultasLaudosRepository) {}

  async create(createConsultaLaudoDto: CreateConsultaLaudoDto) {
    if (!createConsultaLaudoDto.hash_integridade) {
      createConsultaLaudoDto.hash_integridade = 'hash-temporario-gerado-pelo-backend';
    }

    return this.consultasLaudosRepository.create(createConsultaLaudoDto);
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