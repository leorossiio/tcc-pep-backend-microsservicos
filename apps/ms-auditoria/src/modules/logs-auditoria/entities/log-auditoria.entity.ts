import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('logs_auditoria_pg')
export class LogAuditoria {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'atendimento_id', type: 'uuid', nullable: true })
  atendimentoId!: string | null;

  @Column({ name: 'acao_realizada', type: 'varchar' })
  acaoRealizada!: string;

  @CreateDateColumn({ name: 'data_hora', type: 'timestamp' })
  dataHora!: Date;

  @Column({ name: 'ip_origem', type: 'varchar', nullable: true })
  ipOrigem!: string | null;

  @Column({ name: 'entidade_afetada', type: 'varchar' })
  entidadeAfetada!: string;

  @Column({ name: 'entidade_id', type: 'varchar', nullable: true })
  entidadeId!: string | null;

  @Column({ name: 'usuario_responsavel', type: 'varchar', nullable: true })
  usuarioResponsavel!: string | null;
}