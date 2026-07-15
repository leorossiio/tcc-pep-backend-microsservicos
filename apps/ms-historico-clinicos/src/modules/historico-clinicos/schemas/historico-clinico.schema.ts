import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HistoricoClinicoDocument = HistoricoClinico & Document;

@Schema({ timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' } })
export class HistoricoClinico {
  @Prop({ required: true, unique: true, index: true })
  paciente_id: string;

  @Prop({
    type: [{
      substancia: { type: String, required: true },
      severidade: { type: String, enum: ['leve', 'moderada', 'grave'], required: true },
      reacao: { type: String }
    }],
    default: null
  })
  alergias_conhecidas: any[];

  @Prop({
    type: [{
      descricao: { type: String, required: true },
      cid10: { type: String },
      dataDiagnostico: { type: Date },
      ativa: { type: Boolean, required: true }
    }],
    default: null
  })
  comorbidades_previas: any[];

  @Prop({
    type: [{
      tipo: { type: String, required: true },
      motivo: { type: String }
    }],
    default: null
  })
  tipos_sanguineos_incompativeis: any[];

  @Prop({
    type: {
      consentimentoColetado: { type: Boolean, required: true },
      dataConsentimento: { type: Date },
      finalidadeTratamento: { type: String, required: true },
      responsavelTratamento: { type: String, required: true },
      anonimizado: { type: Boolean, required: true },
      dataExclusaoSolicitada: { type: Date }
    },
    required: true
  })
  metadados_lgpd: Record<string, any>;

  @Prop({ required: true })
  hash_integridade: string;
}

export const HistoricoClinicoSchema = SchemaFactory.createForClass(HistoricoClinico);

// Índices adicionais baseados no seu script de migração
HistoricoClinicoSchema.index({ 'alergias_conhecidas.severidade': 1 });
HistoricoClinicoSchema.index({ 'metadados_lgpd.dataExclusaoSolicitada': 1 });