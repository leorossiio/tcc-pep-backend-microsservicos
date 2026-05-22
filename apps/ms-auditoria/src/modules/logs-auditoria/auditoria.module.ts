import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { AuditoriaController } from './controllers/auditoria.controller';
import { AuditoriaService } from './services/auditoria.service';
import { AuditoriaRepository } from './repositories/auditoria.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auditoria]),
    // O LogsAuditoriaModule entrará aqui no próximo passo, quando o criarmos neste MS.
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, AuditoriaRepository],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}