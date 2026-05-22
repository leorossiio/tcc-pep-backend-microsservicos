import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // Correção do nome do módulo

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Garante que o serviço usa a porta correta para não conflitar com os outros
  const port = process.env.PORT_ATENDIMENTOS || 3003; 
  await app.listen(port);
  console.log(`Microsserviço de Atendimentos rodando na porta ${port}`);
}
bootstrap();