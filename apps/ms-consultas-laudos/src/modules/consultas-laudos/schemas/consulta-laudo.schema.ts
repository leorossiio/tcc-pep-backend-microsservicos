// apps/ms-consultas-laudos/src/modules/consultas-laudos/schemas/consulta-laudo.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConsultaLaudoDocument = ConsultaLaudo & Document;

@Schema({ timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' } })
export class ConsultaLaudo {
  @Prop({ required: true })
  atendimento_id: string;

  @Prop({ required: true })
  historico_id: string;

  @Prop({ required: true, index: true })
  paciente_id: string;

  @Prop({ required: true, index: true })
  medico_id: string;

  @Prop({ required: true, type: Date })
  data_registro: Date;

  @Prop({ required: true, enum: ['TRIAGEM', 'CONSULTA', 'EVOLUCAO', 'LAUDO', 'PRESCRICAO', 'ALTA'], index: true })
  tipo_registro: string;

  @Prop({ required: true })
  descricao_clinica: string;

  @Prop({
    type: [{
      medicamento: { type: String, required: true },
      dose: { type: String, required: true },
      frequencia: { type: String, required: true },
      duracao: { type: String }
    }],
    default: null
  })
  prescricoes: any[];

  @Prop({
    type: [{
      tipo: { type: String, required: true },
      descricao: { type: String },
      urlAnexo: { type: String },
      dataRealizacao: { type: Date }
    }],
    default: null
  })
  exames_anexos: any[];

  @Prop({
    type: [{
      substancia: { type: String, required: true },
      severidade: { type: String, enum: ['leve', 'moderada', 'grave'], required: true },
      reacao: { type: String }
    }],
    default: null
  })
  novas_alergias_identificadas: any[];

  @Prop({ required: true })
  hash_integridade: string;
}

export const ConsultaLaudoSchema = SchemaFactory.createForClass(ConsultaLaudo);

// Adicionando o índice composto (medico_id, data_registro: -1)
ConsultaLaudoSchema.index({ medico_id: 1, data_registro: -1 });