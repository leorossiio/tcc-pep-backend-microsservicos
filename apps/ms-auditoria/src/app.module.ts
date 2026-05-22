import { Module } from '@nestjs/common';
import { MsAuditoriaController } from './ms-auditoria.controller';
import { MsAuditoriaService } from './app.service';

@Module({
  imports: [],
  controllers: [MsAuditoriaController],
  providers: [MsAuditoriaService],
})
export class MsAuditoriaModule {}
