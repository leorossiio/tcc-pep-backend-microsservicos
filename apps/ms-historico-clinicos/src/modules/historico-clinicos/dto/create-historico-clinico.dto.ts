import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsDate, 
  IsArray, 
  IsOptional, 
  IsBoolean,
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SeveridadeAlergia {
  LEVE = 'leve',
  MODERADA = 'moderada',
  GRAVE = 'grave',
}

export class AlergiaConhecidaDto {
  @ApiProperty({ example: 'Dipirona' })
  @IsString()
  @IsNotEmpty()
  substancia: string;

  @ApiProperty({ enum: SeveridadeAlergia, example: SeveridadeAlergia.GRAVE })
  @IsEnum(SeveridadeAlergia)
  @IsNotEmpty()
  severidade: SeveridadeAlergia;

  @ApiPropertyOptional({ example: 'Choque anafilático' })
  @IsString()
  @IsOptional()
  reacao?: string;
}

export class ComorbidadePreviaDto {
  @ApiProperty({ example: 'Hipertensão Arterial Sistêmica' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiPropertyOptional({ example: 'I10' })
  @IsString()
  @IsOptional()
  cid10?: string;

  @ApiPropertyOptional({ example: '2020-05-10T00:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataDiagnostico?: Date;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  ativa: boolean;
}

export class TipoSanguineoIncompativelDto {
  @ApiProperty({ example: 'A+' })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiPropertyOptional({ example: 'Reação hemolítica prévia' })
  @IsString()
  @IsOptional()
  motivo?: string;
}

export class MetadadosLgpdDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  consentimentoColetado: boolean;

  @ApiPropertyOptional({ example: '2026-07-15T14:30:00.000Z' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataConsentimento?: Date;

  @ApiProperty({ example: 'Atendimento médico e triagem' })
  @IsString()
  @IsNotEmpty()
  finalidadeTratamento: string;

  @ApiProperty({ example: 'Hospital Central - DPO' })
  @IsString()
  @IsNotEmpty()
  responsavelTratamento: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  anonimizado: boolean;

  @ApiPropertyOptional({ example: null })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataExclusaoSolicitada?: Date;
}

export class CreateHistoricoClinicoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'UUID do paciente (PostgreSQL)' })
  @IsString()
  @IsNotEmpty()
  paciente_id: string;

  @ApiPropertyOptional({ type: [AlergiaConhecidaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlergiaConhecidaDto)
  @IsOptional()
  alergias_conhecidas?: AlergiaConhecidaDto[];

  @ApiPropertyOptional({ type: [ComorbidadePreviaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComorbidadePreviaDto)
  @IsOptional()
  comorbidades_previas?: ComorbidadePreviaDto[];

  @ApiPropertyOptional({ type: [TipoSanguineoIncompativelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TipoSanguineoIncompativelDto)
  @IsOptional()
  tipos_sanguineos_incompativeis?: TipoSanguineoIncompativelDto[];

  @ApiProperty({ type: MetadadosLgpdDto })
  @ValidateNested()
  @Type(() => MetadadosLgpdDto)
  @IsNotEmpty()
  metadados_lgpd: MetadadosLgpdDto;

  @ApiPropertyOptional({ description: 'SHA-256 do documento para integridade LGPD' })
  @IsString()
  @IsOptional()
  hash_integridade?: string;
}