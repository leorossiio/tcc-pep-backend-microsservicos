import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesModule } from './modules/pacientes/pacientes.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Paciente } from './modules/pacientes/entities/paciente.entity';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

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
        synchronize: false, // Tabela já gerenciada pelo monolito — nunca sincronizar automaticamente
      }),
    }),

    // TODO: MongooseModule será adicionado aqui quando o ms-pacientes
    // assumir o domínio de histórico clínico (próxima fase do estrangulamento).

    PacientesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
