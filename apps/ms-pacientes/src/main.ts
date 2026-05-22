import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa a validação global automática para os DTOs (usando class-validator)
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Define a porta 3002 como padrão para o domínio de pacientes
  const port = process.env.PORT_PACIENTES || 3002;
  
  await app.listen(port);
  console.log(`\x1b[32m[NestFactory] Microsserviço de Pacientes iniciado com sucesso na porta ${port}\x1b[0m`);
}
bootstrap();