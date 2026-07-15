import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoricoClinicosController } from './controllers/historico-clinicos.controller';
import { HistoricoClinicosService } from './services/historico-clinicos.service';
import { HistoricoClinicosRepository } from './repositories/historico-clinicos.repository';
import { HistoricoClinico, HistoricoClinicoSchema } from './schemas/historico-clinico.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HistoricoClinico.name, schema: HistoricoClinicoSchema },
    ]),
  ],
  controllers: [HistoricoClinicosController],
  providers: [HistoricoClinicosService, HistoricoClinicosRepository],
  exports: [HistoricoClinicosService],
})
export class HistoricoClinicosModule {}