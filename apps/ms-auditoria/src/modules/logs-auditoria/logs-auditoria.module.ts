// apps/ms-auditoria/src/modules/logs-auditoria/logs-auditoria.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsAuditoriaController } from './controllers/logs-auditoria.controller';
import { LogsAuditoriaService } from './services/logs-auditoria.service';
import { LogsAuditoriaRepository } from './repositories/logs-auditoria.repository';
import { LogAuditoria } from './entities/log-auditoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogAuditoria])],
  controllers: [LogsAuditoriaController],
  providers: [LogsAuditoriaService, LogsAuditoriaRepository],
  exports: [LogsAuditoriaService],
})
export class LogsAuditoriaModule {}