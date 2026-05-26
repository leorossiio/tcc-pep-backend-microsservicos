// apps/ms-medicos/src/modules/medicos/medicos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MedicosController } from './controllers/medicos.controller';
import { MedicosService } from './services/medicos.service';
import { MedicosRepository } from './repositories/medicos.repository';
import { Medico } from './entities/medico.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medico]),
    HttpModule, // Habilita requisições HTTP assíncronas
  ],
  controllers: [MedicosController],
  providers: [MedicosService, MedicosRepository],
  exports: [MedicosService],
})
export class MedicosModule {}