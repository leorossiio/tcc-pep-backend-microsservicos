// apps/ms-atendimentos/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API Atendimentos (Triagem) - Microsserviços')
    .setDescription('Gestão de triagens hospitalares. Auditoria delegada via rede.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT_ATENDIMENTOS || 3003;
  await app.listen(port);
  console.log(`[ms-atendimentos] a rodar na porta ${port} | Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();