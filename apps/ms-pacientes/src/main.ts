// apps/ms-pacientes/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Mantém o mesmo contrato de validação do monólito
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API Pacientes - Microsserviços')
    .setDescription('Gestão isolada de pacientes. Os logs são enviados de forma assíncrona para o ms-auditoria.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT_PACIENTES || 3002;
  await app.listen(port);
  console.log(`[ms-pacientes] a rodar na porta ${port} | Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();