import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from '../../config/database/typeorm.config';
import { MedicosModule } from './modules/medicos/medicos.module';
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
    TypeOrmModule.forRootAsync(typeOrmConfig),
    MedicosModule, // Apenas o módulo estrangulado é importado
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}