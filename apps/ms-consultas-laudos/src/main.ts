import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@pep/common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  const config = new DocumentBuilder()
    .setTitle('API Consultas e Laudos - Microsserviços')
    .setDescription('Serviço responsável pelo agendamento de consultas e emissão de laudos médicos (MongoDB).')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT_CONSULTAS_LAUDOS || 3005;
  await app.listen(port);
  console.log(`[ms-consultas-laudos] a rodar na porta ${port} | Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();