<#
.SYNOPSIS
  Executa os testes de carga k6 contra os microsserviços PEP.

.DESCRIPTION
  Sobe (se necessário) o k6 via docker compose e dispara o cenário escolhido,
  marcando as métricas com a tag system_type para comparação MS x Monolito.

.PARAMETER Scenario
  Cenário de carga: 1 = Normal, 2 = Dia Corrido, 3 = Emergência. Default: 1.

.PARAMETER SystemType
  Rótulo da arquitetura sob teste (vira label no Prometheus). Default: microsservicos.

.EXAMPLE
  .\run-k6.ps1
  Roda o cenário Normal (1) marcando como microsservicos.

.EXAMPLE
  .\run-k6.ps1 -Scenario 2
  Roda o cenário Dia Corrido.

.EXAMPLE
  .\run-k6.ps1 -Scenario 3 -SystemType monolito
  Roda o cenário Emergência marcando as métricas como monolito.
#>
[CmdletBinding()]
param(
  [ValidateSet('1', '2', '3')]
  [string]$Scenario = '3',

  [string]$SystemType = 'microsservicos'
)

$ErrorActionPreference = 'Stop'

# Garante que estamos na pasta do compose (onde este script vive)
Set-Location -Path $PSScriptRoot

$nomes = @{ '1' = 'Normal'; '2' = 'Dia Corrido'; '3' = 'Emergencia' }

Write-Host ''
Write-Host '=========================================================' -ForegroundColor Cyan
Write-Host (" k6 -> Cenario {0} ({1})" -f $Scenario, $nomes[$Scenario]) -ForegroundColor Cyan
Write-Host (" Sistema sob teste: {0}" -f $SystemType) -ForegroundColor Cyan
Write-Host '=========================================================' -ForegroundColor Cyan
Write-Host ''

# Verifica se a stack principal esta de pe (precisa dos 4 MS + prometheus)
$rodando = docker compose ps --status running --services
if (-not ($rodando -contains 'ms-atendimentos')) {
  Write-Host '[aviso] A stack nao parece estar rodando. Subindo com: docker compose up -d' -ForegroundColor Yellow
  docker compose up -d
  Write-Host '[info] Aguardando 8s para os servicos ficarem prontos...' -ForegroundColor DarkGray
  Start-Sleep -Seconds 8
}

# Dispara o k6 (profile load-test). As variaveis vao para o container.
docker compose run --rm `
  -e SCENARIO=$Scenario `
  -e SYSTEM_TYPE=$SystemType `
  k6

$code = $LASTEXITCODE
Write-Host ''
if ($code -eq 0) {
  Write-Host '[ok] Teste finalizado. Metricas enviadas ao Prometheus.' -ForegroundColor Green
} else {
  Write-Host ("[falha] k6 retornou codigo {0} (thresholds estourados ou erro de execucao)." -f $code) -ForegroundColor Red
}
Write-Host 'Dashboards Grafana: http://localhost:3006 (admin/admin)' -ForegroundColor DarkGray
exit $code
