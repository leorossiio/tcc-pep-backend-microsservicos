// apps/ms-auditoria/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API Auditoria - Microsserviços')
    .setDescription('Serviço centralizado para receção e gravação de logs de conformidade (LGPD/Auditoria).')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT_AUDITORIA || 3004;
  await app.listen(port);
  console.log(`[ms-auditoria] a rodar na porta ${port} | Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();