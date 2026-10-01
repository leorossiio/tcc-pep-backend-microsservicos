import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsultasLaudosController } from './controllers/consultas-laudos.controller';
import { ConsultasLaudosService } from './services/consultas-laudos.service';
import { ConsultasLaudosRepository } from './repositories/consultas-laudos.repository';
import { ConsultaLaudo, ConsultaLaudoSchema } from './schemas/consulta-laudo.schema';

@Module({
  imports: [
    // Auditoria do ConsultaLaudo sai por HTTP para o ms-auditoria, espelhando
    // a chamada em processo que o monolito faz ao criar o registro.
    HttpModule,
    MongooseModule.forFeature([
      { name: ConsultaLaudo.name, schema: ConsultaLaudoSchema },
    ]),
  ],
  controllers: [ConsultasLaudosController],
  providers: [ConsultasLaudosService, ConsultasLaudosRepository],
  exports: [ConsultasLaudosService],
})
export class ConsultasLaudosModule {}