// apps/ms-atendimentos/src/modules/atendimentos/atendimentos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AtendimentosController } from './controllers/atendimentos.controller';
import { AtendimentosService } from './services/atendimentos.service';
import { AtendimentosRepository } from './repositories/atendimentos.repository';
import { Atendimento } from './entities/atendimento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Atendimento]),
    HttpModule,
  ],
  controllers: [AtendimentosController],
  providers: [AtendimentosService, AtendimentosRepository],
  exports: [AtendimentosService],
})
export class AtendimentosModule {}