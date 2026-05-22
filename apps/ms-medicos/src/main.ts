import { NestFactory } from '@nestjs/core';
import { AppModule } from './../src/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {

   const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ transform: true }));


  const port = process.env.PORT_MEDICOS ?? 3001;
  
  await app.listen(port);
  console.log(`\x1b[32m[NestFactory] Microsserviço de Médicos iniciado com sucesso na porta ${port}\x1b[0m`);

  
}
bootstrap();