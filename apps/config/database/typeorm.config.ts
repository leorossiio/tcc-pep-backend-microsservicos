import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres' as const,
    host: configService.get<string>('POSTGRES_HOST', 'localhost'),
    port: configService.get<number>('POSTGRES_PORT', 5432),
    username: configService.get<string>('POSTGRES_USER', 'root'),
    password: configService.get<string>('POSTGRES_PASSWORD', 'rootpassword'),
    database: configService.get<string>('POSTGRES_DB', 'pep_relacional'),
    autoLoadEntities: true,
    synchronize: false, // Tabela já gerenciada pelo monolito — nunca sincronizar automaticamente
    migrationsRun: false,
    migrations: [join(__dirname, '../../migrations/**/*{.ts,.js}')],
    logging: configService.get<string>('NODE_ENV') === 'development',
  }),
};