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
    .setTitle('API Histórico Clínico - Microsserviços')
    .setDescription('Serviço responsável pelo gerenciamento de prontuários e evolução clínica (MongoDB).')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT_HISTORICO_CLINICOS || 3006;
  await app.listen(port);
  console.log(`[ms-historico-clinicos] a rodar na porta ${port} | Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();