import { NestFactory } from '@nestjs/core';
import { MsAuditoriaModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(MsAuditoriaModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
