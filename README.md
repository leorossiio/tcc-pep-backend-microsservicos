# Benchmarking de Persistência Poliglota — Microsserviços

Versão do README adaptada para a arquitetura baseada em microsserviços do projeto de TCC.

## Visão Geral

Este repositório contém uma implementação em microsserviços para o benchmark de persistência poliglota no contexto de Prontuários Eletrônicos (PEP). Cada domínio principal foi isolado em um microserviço NestJS independente, comunicando-se via HTTP interno e utilizando bancos de dados especializados (PostgreSQL e MongoDB) conforme a necessidade.

## Serviços (apps/)

- `ms-atendimentos` — Triagem e gerenciamento de atendimentos (PostgreSQL)
- `ms-pacientes` — Cadastros e dados pessoais dos pacientes (PostgreSQL)
- `ms-medicos` — Gestão de profissionais de saúde (PostgreSQL)
- `ms-auditoria` — Logs de auditoria e rastreabilidade (PostgreSQL)
- `ms-consultas-laudos` — Registros clínicos e laudos (MongoDB)

Cada serviço tem sua própria entrada em `apps/<nome>/src` com `main.ts`, `app.module.ts`, módulos, controllers, services, repositórios e DTOs.

## Arquitetura

- Banco relacional (PostgreSQL) para entidades transacionais e relações críticas: pacientes, médicos, atendimentos e logs de auditoria.
- Banco não-relacional (MongoDB) para documentos semiestruturados: consultas, laudos e histórico clínico.
- Observabilidade: Prometheus coleta métricas; Grafana exibe dashboards pré-configurados.
- Testes de carga: k6 executa cenários de emergência para comparar latências e throughput entre abordagens.

Arquitetura lógica:

ms-pacientes  →  ms-atendimentos  →  ms-consultas-laudos
       ↘                 ↘
     ms-medicos        ms-auditoria

(Comunicação HTTP interna e APIs REST públicas do cluster)

## Endpoints Principais (por microserviço)

Nota: cada microserviço expõe endpoints semelhantes aos do monolito, porém limitados ao seu escopo.

- ms-atendimentos
  - `POST /atendimentos`
  - `GET /atendimentos`
  - `GET /atendimentos/:id`
  - `PUT /atendimentos/:id`
  - `DELETE /atendimentos/:id`

- ms-pacientes
  - `POST /pacientes`
  - `GET /pacientes`
  - `GET /pacientes/:id`
  - `PUT /pacientes/:id`
  - `DELETE /pacientes/:id`

- ms-medicos
  - `POST /medicos`
  - `GET /medicos`
  - `GET /medicos/:id`
  - `PUT /medicos/:id`

- ms-consultas-laudos
  - `POST /consultas-laudos`
  - `GET /consultas-laudos`
  - `GET /consultas-laudos/atendimento/:atendimentoId`
  - `GET /consultas-laudos/paciente/:pacienteId`

- ms-auditoria
  - `GET /logs-auditoria`
  - `GET /logs-auditoria/atendimento/:atendimentoId`
  - `GET /logs-auditoria/paciente/:pacienteId`

## Como Executar Localmente (Microsserviços)

1. Instale dependências na raiz e nos pacotes quando necessário:

```bash
npm install
```

2. Copie e ajuste variáveis de ambiente (arquivo `.env`) para cada serviço. Use `.env.example` como referência.

3. Suba a infraestrutura via Docker Compose (bancos, Prometheus e Grafana):

```bash
docker compose up -d
docker compose ps
```

4. Inicie cada microserviço no modo desenvolvimento (no workspace):

```bash
# Exemplo: iniciar ms-atendimentos
cd apps/ms-atendimentos
npm run start:dev

# Repetir para ms-pacientes, ms-medicos, ms-consultas-laudos, ms-auditoria
```

5. Verifique saúde:

```bash
curl http://localhost:<PORT_DO_SERVICO>/health
```

Observação: cada serviço expõe `PORT` configurável via `.env` — ver `apps/<servico>/tsconfig.app.json` e `main.ts` para valores padrões.

## Integração entre Serviços

- Padrão de comunicação: chamadas HTTP diretas entre serviços para operações síncronas simples.
- Propagação de eventos (opcional): implementar eventos assíncronos (RabbitMQ / Kafka) caso deseje desacoplar gravações e garantir disponibilidade durante picos.
- Estratégia de consistência: dual-write no fluxo de criação (quando aplicável) e reconciliação por jobs/consumers.

## Migrations e Inicialização de Dados

- PostgreSQL: scripts de migration estão em `migration/postgres/` (ex.: `01-schema.sql`).
- MongoDB: inicializadores e índices em `migration/mongoDB/`.

## Testes e Benchmarking

- Unitários e E2E: `npm run test` e `npm run test:e2e` em cada microserviço (quando aplicável).
- k6: scripts em `k6-scripts/` — utilize para cenários de emergência e comparação entre topologias.

Exemplo k6 dentro do container:

```bash
docker exec -it k6_pep sh
k6 run /scripts/cenario-emergencia.js
```

## Observabilidade

- Prometheus coleta métricas expostas por cada serviço (instrumentação com `@willsoto/nestjs-prometheus` ou similar).
- Grafana configurado com dashboards em `grafana/provisioning/dashboards/`.

## Segurança e LGPD

- Cada serviço registra auditoria em `ms-auditoria` (PostgreSQL).
- Dados sensíveis são tratados conforme política do monolito: hashes, consentimento e retenção configurável.

## Troubleshooting Rápido

- Porta em uso: altere `PORT` do serviço no `.env` ou finalize o processo.
- Banco não inicializa: verifique `docker compose logs` e credenciais no `.env`.
- Migrations faltando: execute `psql`/cliente DB ou reconstrua os volumes com `docker compose down -v` e `up -d`.

## Contribuição

1. Crie uma branch `feature/<descrição>`
2. Adicione testes para novas funcionalidades
3. Abra PR para revisão

---

Arquivo de referência do monolito: [README.md](README.md)

---

Centro Universitário UniFacens — Engenharia da Computação — 2026