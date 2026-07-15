import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsDate, 
  IsArray, 
  IsOptional, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoRegistro {
  TRIAGEM = 'TRIAGEM',
  CONSULTA = 'CONSULTA',
  EVOLUCAO = 'EVOLUCAO',
  LAUDO = 'LAUDO',
  PRESCRICAO = 'PRESCRICAO',
  ALTA = 'ALTA',
}

export enum SeveridadeAlergia {
  LEVE = 'leve',
  MODERADA = 'moderada',
  GRAVE = 'grave',
}

export class PrescricaoDto {
  @ApiProperty({ example: 'Dipirona 500mg' })
  @IsString()
  @IsNotEmpty()
  medicamento: string;

  @ApiProperty({ example: '1 comprimido' })
  @IsString()
  @IsNotEmpty()
  dose: string;

  @ApiProperty({ example: 'De 8 em 8 horas' })
  @IsString()
  @IsNotEmpty()
  frequencia: string;

  @ApiPropertyOptional({ example: '5 dias' })
  @IsString()
  @IsOptional()
  duracao?: string;
}

export class ExameAnexoDto {
  @ApiProperty({ example: 'Hemograma Completo' })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiPropertyOptional({ example: 'Coleta de sangue venoso' })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({ example: 'https://storage.exemplo.com/exames/123.pdf' })
  @IsString()
  @IsOptional()
  urlAnexo?: string;

  @ApiPropertyOptional({ example: '2026-07-15T10:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataRealizacao?: Date;
}

export class NovaAlergiaDto {
  @ApiProperty({ example: 'Ibuprofeno' })
  @IsString()
  @IsNotEmpty()
  substancia: string;

  @ApiProperty({ enum: SeveridadeAlergia, example: SeveridadeAlergia.MODERADA })
  @IsEnum(SeveridadeAlergia)
  @IsNotEmpty()
  severidade: SeveridadeAlergia;

  @ApiPropertyOptional({ example: 'Erupções cutâneas e coceira' })
  @IsString()
  @IsOptional()
  reacao?: string;
}

export class CreateConsultaLaudoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID do atendimento (PostgreSQL)' })
  @IsString()
  @IsNotEmpty()
  atendimento_id: string;

  @ApiProperty({ example: '60d5ec49f1b2c8b1f8e4e1a1', description: 'ID do histórico clínico (MongoDB)' })
  @IsString()
  @IsNotEmpty()
  historico_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'ID do paciente' })
  @IsString()
  @IsNotEmpty()
  paciente_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002', description: 'ID do médico' })
  @IsString()
  @IsNotEmpty()
  medico_id: string;

  @ApiProperty({ example: '2026-07-15T14:30:00.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  data_registro: Date;

  @ApiProperty({ enum: TipoRegistro, example: TipoRegistro.CONSULTA })
  @IsEnum(TipoRegistro)
  @IsNotEmpty()
  tipo_registro: TipoRegistro;

  @ApiProperty({ example: 'Paciente relata dores de cabeça intensas há 3 dias...' })
  @IsString()
  @IsNotEmpty()
  descricao_clinica: string;

  @ApiPropertyOptional({ type: [PrescricaoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescricaoDto)
  @IsOptional()
  prescricoes?: PrescricaoDto[];

  @ApiPropertyOptional({ type: [ExameAnexoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExameAnexoDto)
  @IsOptional()
  exames_anexos?: ExameAnexoDto[];

  @ApiPropertyOptional({ type: [NovaAlergiaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NovaAlergiaDto)
  @IsOptional()
  novas_alergias_identificadas?: NovaAlergiaDto[];

  // Nota: Geralmente o hash_integridade é gerado no Service backend (ex: com crypto.util.ts) 
  // antes de salvar no banco, e não recebido diretamente no DTO pelo cliente. 
  // Porém, se o seu Gateway ou serviço upstream enviar isso, ele fica mapeado aqui.
  @ApiPropertyOptional({ description: 'Hash SHA-256 gerado para integridade LGPD' })
  @IsString()
  @IsOptional()
  hash_integridade?: string;
}