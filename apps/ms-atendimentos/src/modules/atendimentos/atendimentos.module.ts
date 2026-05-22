import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Atendimento } from './entities/atendimento.entity';
import { AtendimentosController } from './controllers/atendimentos.controller';
import { AtendimentosService } from './services/atendimentos.service';
import { AtendimentosRepository } from './repositories/atendimentos.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Atendimento]),
    // O LogsAuditoriaModule entrará aqui no próximo passo, quando o criarmos neste MS.
  ],
  controllers: [AtendimentosController],
  providers: [AtendimentosService, AtendimentosRepository],
  exports: [AtendimentosService],
})
export class AtendimentosModule {}