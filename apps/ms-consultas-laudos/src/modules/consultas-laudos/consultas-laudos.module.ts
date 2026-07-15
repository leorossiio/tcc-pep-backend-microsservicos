import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsultasLaudosController } from './controllers/consultas-laudos.controller';
import { ConsultasLaudosService } from './services/consultas-laudos.service';
import { ConsultasLaudosRepository } from './repositories/consultas-laudos.repository';
import { ConsultaLaudo, ConsultaLaudoSchema } from './schemas/consulta-laudo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConsultaLaudo.name, schema: ConsultaLaudoSchema },
    ]),
  ],
  controllers: [ConsultasLaudosController],
  providers: [ConsultasLaudosService, ConsultasLaudosRepository],
  exports: [ConsultasLaudosService],
})
export class ConsultasLaudosModule {}