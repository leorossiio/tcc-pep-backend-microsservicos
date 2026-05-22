import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

export enum RiscoManchester {
  VERMELHO = 'VERMELHO',
  LARANJA = 'LARANJA',
  AMARELO = 'AMARELO',
  VERDE = 'VERDE',
  AZUL = 'AZUL',
}

@Entity('atendimentos_pg')
export class Atendimento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // FK Lógica para ms-pacientes
  @Column({ name: 'paciente_id', type: 'uuid' })
  pacienteId!: string;

  // FK Lógica para ms-medicos
  @Column({ name: 'medico_triagem_id', type: 'uuid' })
  medicoTriagemId!: string;

  @Column({ name: 'data_hora_entrada', type: 'timestamp' })
  dataHoraEntrada!: Date;

  @Column({ name: 'queixa_principal', type: 'varchar' })
  queixaPrincipal!: string;

  @Column({ name: 'pressao_arterial', type: 'varchar', nullable: true })
  pressaoArterial!: string;

  @Column({ name: 'frequencia_cardiaca', type: 'int', nullable: true })
  frequenciaCardiaca!: number;

  @Column({ name: 'saturacao_oxigenio', type: 'int', nullable: true })
  saturacaoOxigenio!: number;

  @Column({ name: 'temperatura_corporal', type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperaturaCorporal!: number;

  @Column({ name: 'frequencia_respiratoria', type: 'int', nullable: true })
  frequenciaRespiratoria!: number;

  @Column({
    name: 'classificacao_risco',
    type: 'enum',
    enum: RiscoManchester,
  })
  classificacaoRisco!: RiscoManchester;
}