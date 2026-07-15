import { NestFactory } from '@nestjs/core';
import { AppModule } from './api-gateway.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Roteamento para Médicos (Porta 3001)
  app.use(
    '/medicos',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    }),
  );

  // Roteamento para Pacientes (Porta 3002)
  app.use(
    '/pacientes',
    createProxyMiddleware({
      target: 'http://localhost:3002', 
      changeOrigin: true,
    }),
  );

  // Roteamento para Atendimentos (Porta 3003)
  app.use(
    '/atendimentos',
    createProxyMiddleware({
      target: 'http://localhost:3003',
      changeOrigin: true,
    }),
  );

  // Roteamento para Auditoria (Porta 3004)
  app.use(
    '/auditoria',
    createProxyMiddleware({
      target: 'http://localhost:3004',
      changeOrigin: true,
    }),
  );

  app.use(
    '/consultas-laudos',
    createProxyMiddleware({
      target: 'http://localhost:3005',
      changeOrigin: true,
    }),
  );

  // Roteamento para Histórico Clínico (Porta 3006)
  app.use(
    '/historico-clinicos',
    createProxyMiddleware({
      target: 'http://localhost:3006',
      changeOrigin: true,
    }),
  );

  // O API Gateway vai rodar na porta 4000
  await app.listen(4000);
  console.log('🚀 API Gateway rodando na porta 4000');
}
bootstrap();