// apps/ms-pacientes/src/modules/pacientes/pacientes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PacientesController } from './controllers/pacientes.controller';
import { PacientesService } from './services/pacientes.service';
import { PacientesRepository } from './repositories/pacientes.repository';
import { Paciente } from './entities/paciente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente]),
    HttpModule, // Habilita requisições para outros microsserviços
  ],
  controllers: [PacientesController],
  providers: [PacientesService, PacientesRepository],
  exports: [PacientesService],
})
export class PacientesModule {}