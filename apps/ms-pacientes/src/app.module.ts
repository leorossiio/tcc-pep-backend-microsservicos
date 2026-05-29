import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesModule } from './modules/pacientes/pacientes.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Paciente } from './modules/pacientes/entities/paciente.entity';
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
    // Conexão com o PostgreSQL (tabela pacientes_pg — compartilhada com o monolito)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'root'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'rootpassword'),
        database: configService.get<string>('POSTGRES_DB', 'pep_relacional'),
        entities: [Paciente],
        synchronize: false,
      }),
    }),
    PacientesModule,
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
