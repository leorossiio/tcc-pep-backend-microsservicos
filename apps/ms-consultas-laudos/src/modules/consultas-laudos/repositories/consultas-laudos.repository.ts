import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConsultaLaudo, ConsultaLaudoDocument } from '../schemas/consulta-laudo.schema';
import { CreateConsultaLaudoDto } from '../dto/create-consulta-laudo.dto';
import { UpdateConsultaLaudoDto } from '../dto/update-consulta-laudo.dto';

@Injectable()
export class ConsultasLaudosRepository {
  constructor(
    @InjectModel(ConsultaLaudo.name) private readonly consultaLaudoModel: Model<ConsultaLaudoDocument>,
  ) {}

  async create(createConsultaLaudoDto: CreateConsultaLaudoDto): Promise<ConsultaLaudoDocument> {
    const novaConsulta = new this.consultaLaudoModel(createConsultaLaudoDto);
    return novaConsulta.save();
  }

  async findAll(): Promise<ConsultaLaudoDocument[]> {
    return this.consultaLaudoModel.find().exec();
  }

  async findById(id: string): Promise<ConsultaLaudoDocument | null> {
    return this.consultaLaudoModel.findById(id).exec();
  }

  async findByPacienteId(pacienteId: string): Promise<ConsultaLaudoDocument[]> {
    return this.consultaLaudoModel.find({ paciente_id: pacienteId }).exec();
  }

  async update(id: string, updateConsultaLaudoDto: UpdateConsultaLaudoDto): Promise<ConsultaLaudoDocument | null> {
    return this.consultaLaudoModel
      .findByIdAndUpdate(id, updateConsultaLaudoDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<ConsultaLaudoDocument | null> {
    return this.consultaLaudoModel.findByIdAndDelete(id).exec();
  }
}