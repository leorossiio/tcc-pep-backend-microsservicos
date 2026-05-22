import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from '../../config/database/typeorm.config';
import { AtendimentosModule } from './modules/atendimentos/atendimentos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AtendimentosModule, // Apenas o módulo estrangulado é importado
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}