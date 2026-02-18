#!/usr/bin/env node

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_P95_MS = 1000;
const DEFAULT_P99_MS = 2000;
const DEFAULT_5XX_RATE = 0.02;

const baseUrl = (process.argv[2] || process.env.OBS_BASE_URL || '').replace(/\/$/, '');

if (!baseUrl) {
  console.error('Usage: node scripts/observability-evidence.mjs <base-url>');
  console.error('Example: node scripts/observability-evidence.mjs https://api.example.com');
  process.exit(1);
}

const timeout = Number(process.env.OBS_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
const p95Limit = Number(process.env.OBS_P95_LIMIT_MS || DEFAULT_P95_MS);
const p99Limit = Number(process.env.OBS_P99_LIMIT_MS || DEFAULT_P99_MS);
const fiveXxLimit = Number(process.env.OBS_5XX_RATE_LIMIT || DEFAULT_5XX_RATE);

const withTimeout = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`${url} returned HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

const now = new Date().toISOString();

try {
  const [health, metrics] = await Promise.all([
    withTimeout(`${baseUrl}/health`),
    withTimeout(`${baseUrl}/metrics`),
  ]);

  const total = Number(metrics?.http?.totalRequests || 0);
  const byStatusClass = metrics?.http?.byStatusClass || {};
  const fiveXxCount = Number(byStatusClass['5xx'] || 0);
  const fiveXxRate = total > 0 ? fiveXxCount / total : 0;
  const routes = Array.isArray(metrics?.http?.routes) ? metrics.http.routes : [];

  const p95Breaches = routes.filter((r) => Number(r?.latencyMs?.p95 || 0) > p95Limit);
  const p99Breaches = routes.filter((r) => Number(r?.latencyMs?.p99 || 0) > p99Limit);

  const lines = [];
  lines.push(`# Evidencia de observabilidad`);
  lines.push(``);
  lines.push(`Fecha UTC: ${now}`);
  lines.push(`Base URL: ${baseUrl}`);
  lines.push(`Estado health: ${health?.status ?? 'unknown'}`);
  lines.push(`Request ID (health): ${health?.requestId ?? 'n/a'}`);
  lines.push(``);
  lines.push(`## Resumen`);
  lines.push(`- Total requests: ${total}`);
  lines.push(`- 5xx count: ${fiveXxCount}`);
  lines.push(`- 5xx rate: ${(fiveXxRate * 100).toFixed(2)}% (límite ${(fiveXxLimit * 100).toFixed(2)}%)`);
  lines.push(`- Rutas con breach p95>${p95Limit}ms: ${p95Breaches.length}`);
  lines.push(`- Rutas con breach p99>${p99Limit}ms: ${p99Breaches.length}`);
  lines.push(``);
  lines.push(`## Alertas`);
  lines.push(`- Error rate 5xx: ${fiveXxRate > fiveXxLimit ? 'ALERTA' : 'OK'}`);
  lines.push(`- Latencia p95: ${p95Breaches.length > 0 ? 'ALERTA' : 'OK'}`);
  lines.push(`- Latencia p99: ${p99Breaches.length > 0 ? 'ALERTA' : 'OK'}`);
  lines.push(``);
  lines.push(`## Top rutas por tráfico (hasta 10)`);

  routes
    .slice()
    .sort((a, b) => Number(b?.requests || 0) - Number(a?.requests || 0))
    .slice(0, 10)
    .forEach((r) => {
      lines.push(
        `- ${r.route}: req=${r.requests}, err=${r.errors}, p95=${r.latencyMs?.p95 ?? 0}ms, p99=${r.latencyMs?.p99 ?? 0}ms`
      );
    });

  console.log(lines.join('\n'));
} catch (error) {
  console.error(`Failed to collect observability evidence: ${error.message}`);
  process.exit(1);
}
