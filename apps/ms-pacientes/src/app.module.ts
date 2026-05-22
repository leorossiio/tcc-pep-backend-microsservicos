import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesModule } from './modules/pacientes/pacientes.module';
import { Paciente } from './modules/pacientes/entities/paciente.entity';

@Module({
  imports: [
    // Carrega o arquivo .env global da raiz do projeto
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Configura a conexão com o PostgreSQL de forma assíncrona
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
    // Importa o módulo isolado de pacientes que estruturamos
    PacientesModule,
  ],
})
export class AppModule {}