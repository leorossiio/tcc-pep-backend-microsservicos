import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from '../../config/database/typeorm.config';
import { AtendimentosModule } from './modules/atendimentos/atendimentos.module';
import { PrometheusModule, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { HttpMetricsInterceptor } from '@pep/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AtendimentosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duração das requisições HTTP em segundos',
      labelNames: ['method', 'path', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 2, 5],
    }),
    { provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor },
  ],
})
export class AppModule {}