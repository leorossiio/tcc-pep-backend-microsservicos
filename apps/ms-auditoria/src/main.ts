import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT_AUDITORIA || 3004;
  await app.listen(port);
  console.log(`Microsserviço de Auditoria a rodar na porta ${port}`);
}
bootstrap();