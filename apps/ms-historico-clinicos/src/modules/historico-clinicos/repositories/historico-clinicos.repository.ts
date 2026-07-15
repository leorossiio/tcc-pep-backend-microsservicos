import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoricoClinico, HistoricoClinicoDocument } from '../schemas/historico-clinico.schema';
import { CreateHistoricoClinicoDto } from '../dto/create-historico-clinico.dto';
import { UpdateHistoricoClinicoDto } from '../dto/update-historico-clinico.dto';

@Injectable()
export class HistoricoClinicosRepository {
  constructor(
    @InjectModel(HistoricoClinico.name) private readonly historicoClinicoModel: Model<HistoricoClinicoDocument>,
  ) {}

  async create(createHistoricoClinicoDto: CreateHistoricoClinicoDto): Promise<HistoricoClinicoDocument> {
    const novoHistorico = new this.historicoClinicoModel(createHistoricoClinicoDto);
    return novoHistorico.save();
  }

  async findAll(): Promise<HistoricoClinicoDocument[]> {
    return this.historicoClinicoModel.find().exec();
  }

  async findById(id: string): Promise<HistoricoClinicoDocument | null> {
    return this.historicoClinicoModel.findById(id).exec();
  }

  async findByPacienteId(pacienteId: string): Promise<HistoricoClinicoDocument | null> {
    // Retorna findOne porque a relação paciente <-> histórico é 1:1 na sua modelagem
    return this.historicoClinicoModel.findOne({ paciente_id: pacienteId }).exec();
  }

  async update(id: string, updateHistoricoClinicoDto: UpdateHistoricoClinicoDto): Promise<HistoricoClinicoDocument | null> {
    return this.historicoClinicoModel
      .findByIdAndUpdate(id, updateHistoricoClinicoDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<HistoricoClinicoDocument | null> {
    return this.historicoClinicoModel.findByIdAndDelete(id).exec();
  }
}