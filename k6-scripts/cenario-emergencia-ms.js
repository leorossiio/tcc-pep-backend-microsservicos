import http from 'k6/http';
import { check, sleep, fail } from 'k6';

// Cada microsserviço tem sua própria URL (nomes dos containers no docker-compose)
const MS_MEDICOS      = 'http://ms-medicos:3001';
const MS_PACIENTES    = 'http://ms-pacientes:3002';
const MS_ATENDIMENTOS = 'http://ms-atendimentos:3003';
const MS_AUDITORIA    = 'http://ms-auditoria:3004';
const HEADERS = { 'Content-Type': 'application/json' };

// --- Perfis de carga (3 minutos cada) ----------------------------------------
const SCENARIOS = {
  '1': {
    stages: [
      { duration: '30s', target: 50 },
      { duration: '2m',  target: 50 },
      { duration: '30s', target: 0  },
    ],
    thresholds: {
      http_req_duration: ['p(95)<800'],
      http_req_failed:   ['rate<0.01'],
    },
  },
  '2': {
    stages: [
      { duration: '30s', target: 100 },
      { duration: '2m',  target: 100 },
      { duration: '30s', target: 0   },
    ],
    thresholds: {
      http_req_duration: ['p(95)<1200'],
      http_req_failed:   ['rate<0.05'],
    },
  },
  '3': {
    stages: [
      { duration: '45s',   target: 250 },
      { duration: '1m30s', target: 250 },
      { duration: '45s',   target: 0   },
    ],
    thresholds: {
      http_req_duration: ['p(95)<3000'],
      http_req_failed:   ['rate<0.15'],
    },
  },
};

const scenarioKey      = __ENV.SCENARIO || '1';
const selectedScenario = SCENARIOS[scenarioKey];

if (!selectedScenario) {
  fail(`Cenario invalido: SCENARIO=${scenarioKey}. Use 1 (Normal), 2 (Dia Corrido) ou 3 (Emergencia).`);
}

export const options = {
  stages: selectedScenario.stages,
  thresholds: selectedScenario.thresholds,
  tags: {
    test_scenario: scenarioKey === '1' ? 'normal' : scenarioKey === '2' ? 'dia-corrido' : 'emergencia',
  },
};

// --- Helpers -----------------------------------------------------------------
function postJson(url, body) {
  return http.post(url, JSON.stringify(body), { headers: HEADERS });
}

function assertCreated(res, label) {
  if (res.status !== 201) {
    console.error(`[setup] FALHA em ${label}: status=${res.status} body=${res.body}`);
    fail(`setup falhou em: ${label}`);
  }
  return res.json();
}

function assertOk(res, label) {
  if (res.status !== 200) {
    console.error(`[setup] FALHA em ${label}: status=${res.status} body=${res.body}`);
    fail(`setup falhou em: ${label}`);
  }
  return res.json();
}

// --- setup() -----------------------------------------------------------------
export function setup() {
  const ts = Date.now();

  // ms-medicos
  const medico = assertCreated(
    postJson(`${MS_MEDICOS}/medicos`, {
      nomeCompleto: 'Dr. K6 Benchmark',
      crm: `K6${ts}/SP`,
      especialidade: 'Clinica Geral',
      ativo: true,
    }),
    'POST /medicos',
  );

  // ms-pacientes
  const cpf = String(ts).slice(-11).padStart(11, '1');
  const paciente = assertCreated(
    postJson(`${MS_PACIENTES}/pacientes`, {
      nomeCompleto: 'Paciente Benchmark K6',
      sexo: 'M',
      cpf,
      dataNascimento: '1990-01-15',
      consentimentoLgpd: true,
    }),
    'POST /pacientes',
  );

  // ms-atendimentos
  const atendimentoRes = assertCreated(
    postJson(`${MS_ATENDIMENTOS}/atendimentos`, {
      pacienteId: paciente.id,
      medicoTriagemId: medico.id,
      dataHoraEntrada: new Date().toISOString(),
      queixaPrincipal: 'Setup k6 - dor abdominal aguda',
      pressaoArterial: '120/80',
      frequenciaCardiaca: 80,
      saturacaoOxigenio: 98,
      temperaturaCorporal: 36.8,
      frequenciaRespiratoria: 16,
      classificacaoRisco: 'AMARELO',
    }),
    'POST /atendimentos',
  );
  // O service retorna { success, atendimentoId, dados } — não .id direto
  const atendimentoId = atendimentoRes.atendimentoId ?? atendimentoRes.dados?.id ?? atendimentoRes.id;

  // ms-auditoria — registra o evento de setup
  postJson(`${MS_AUDITORIA}/logs-auditoria`, {
    acao: 'CREATE',
    entidade: 'atendimento',
    entidadeId: atendimentoId,
    dadosNovos: { origem: 'k6-setup', medicoId: medico.id, pacienteId: paciente.id },
  });

  console.log(`[setup] OK — medicoId=${medico.id} pacienteId=${paciente.id} atendimentoId=${atendimentoId}`);
  return {
    medicoId:      medico.id,
    pacienteId:    paciente.id,
    atendimentoId: atendimentoId,
  };
}

// --- default() ---------------------------------------------------------------
export default function (data) {
  const { medicoId, pacienteId, atendimentoId } = data;

  // [1] Buscar triagem específica — ms-atendimentos
  const resAtendimento = http.get(`${MS_ATENDIMENTOS}/atendimentos/${atendimentoId}`);
  check(resAtendimento, {
    '[ms-atendimentos] GET atendimento 200':    (r) => r.status === 200,
    '[ms-atendimentos] GET atendimento <500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);

  // [2] Buscar paciente — ms-pacientes (substitui historico-completo, que não existe neste projeto)
  const resPaciente = http.get(`${MS_PACIENTES}/pacientes/${pacienteId}`);
  check(resPaciente, {
    '[ms-pacientes] GET paciente 200':    (r) => r.status === 200,
    '[ms-pacientes] GET paciente <500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);

  // [3] Criar novo atendimento — ms-atendimentos (dual-write principal)
  const resAtend = postJson(`${MS_ATENDIMENTOS}/atendimentos`, {
    pacienteId,
    medicoTriagemId: medicoId,
    dataHoraEntrada: new Date().toISOString(),
    queixaPrincipal: `VU ${__VU} iter ${__ITER} — dor toracica intensa`,
    pressaoArterial: '150/95',
    frequenciaCardiaca: 110,
    saturacaoOxigenio: 94,
    temperaturaCorporal: 38.1,
    frequenciaRespiratoria: 22,
    classificacaoRisco: 'VERMELHO',
  });
  check(resAtend, {
    '[ms-atendimentos] POST atendimento 201':    (r) => r.status === 201,
    '[ms-atendimentos] POST atendimento <800ms': (r) => r.timings.duration < 800,
  });
  sleep(1);

  // [4] Listar triagens do médico — ms-atendimentos (substitui GET /medicos/:id/laudos)
  const resLaudosMedico = http.get(`${MS_ATENDIMENTOS}/atendimentos/medico/${medicoId}`);
  check(resLaudosMedico, {
    '[ms-atendimentos] GET atendimentos/medico 200':    (r) => r.status === 200,
    '[ms-atendimentos] GET atendimentos/medico <700ms': (r) => r.timings.duration < 700,
  });
  sleep(1);

  // [5] Listar triagens do paciente — ms-atendimentos
  const resAtendPaciente = http.get(`${MS_ATENDIMENTOS}/atendimentos/paciente/${pacienteId}`);
  check(resAtendPaciente, {
    '[ms-atendimentos] GET atendimentos/paciente 200':    (r) => r.status === 200,
    '[ms-atendimentos] GET atendimentos/paciente <700ms': (r) => r.timings.duration < 700,
  });
  sleep(1);
}
