import { NestFactory } from '@nestjs/core';
import { AppModule } from './api-gateway.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AllExceptionsFilter } from '@pep/common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());
  // Em Docker cada serviço roda em seu próprio container: "localhost" aqui
  // dentro se refere ao próprio api-gateway, não aos outros serviços.
  // Por isso os alvos vêm de variáveis de ambiente (nome do container/DNS
  // interno da rede pep_network_ms), com fallback para localhost apenas
  // para rodar tudo fora do Docker durante desenvolvimento local.
  const routes: Record<string, string> = {
    '/medicos': process.env.URL_MEDICOS || 'http://localhost:3001',
    '/pacientes': process.env.URL_PACIENTES || 'http://localhost:3002',
    '/atendimentos': process.env.URL_ATENDIMENTOS || 'http://localhost:3003',
    '/auditoria': process.env.URL_AUDITORIA || 'http://localhost:3004',
    '/consultas-laudos': process.env.URL_CONSULTAS_LAUDOS || 'http://localhost:3005',
    '/historico-clinicos': process.env.URL_HISTORICO_CLINICOS || 'http://localhost:3006',
  };

  for (const [path, target] of Object.entries(routes)) {
    app.use(path, createProxyMiddleware({ target, changeOrigin: true }));
  }

  const port = process.env.PORT_GATEWAY || 4000;
  await app.listen(port);
  console.log(`🚀 API Gateway rodando na porta ${port}`);
}
bootstrap();
