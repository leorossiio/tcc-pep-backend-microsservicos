import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateLogAuditoriaDto {
  @IsOptional()
  @IsString()
  atendimentoId?: string | null;

  @IsNotEmpty()
  @IsString()
  acaoRealizada!: string;

  @IsOptional()
  @IsString()
  ipOrigem?: string | null;

  @IsNotEmpty()
  @IsString()
  entidadeAfetada!: string;

  @IsOptional()
  @IsString()
  entidadeId?: string | null;

  @IsOptional()
  @IsString()
  usuarioResponsavel?: string | null;
}