# Observabilidad Baseline

Fecha: 18 de febrero de 2026

## Objetivo

Disponer de una base operativa para diagnosticar incidencias con correlación por request y métricas HTTP de latencia/errores.

## Qué se implementó

1. `x-request-id` en backend y frontend.

- Backend: si llega `x-request-id`, lo reutiliza; si no, genera UUID.
- Siempre devuelve `x-request-id` en la respuesta.
- Frontend: envía `x-request-id` en llamadas API (`apiService`, `geminiService`, `videoGenerationService`).

2. Logging HTTP estructurado.

- Middleware `pino-http` con `requestId` en cada evento.
- Niveles por status (`info`, `warn`, `error`).

3. Endpoint de métricas HTTP.

- Ruta: `GET /metrics`
- Devuelve snapshot JSON con:
  - `totalRequests`
  - `inFlightRequests`
  - `byMethod`
  - `byStatusClass`
  - `routes[]` con `requests`, `errors` y latencias `avg/p50/p95/p99/max`.

4. Endpoint de salud con correlación.

- Ruta: `GET /health`
- Incluye `requestId` en payload.

## Uso operativo rápido

1. Comprobar salud:

```bash
curl -i http://localhost:3001/health
```

2. Consultar métricas:

```bash
curl http://localhost:3001/metrics
```

3. Correlacionar un error:

- Tomar `x-request-id` de respuesta en frontend.
- Buscar en logs backend por `requestId`.
- Revisar ruta/status/duración y contexto del error.

## Alertas mínimas recomendadas (producción)

- Tasa `5xx` global > `2%` durante 5 minutos.
- `p95` por ruta > `1000ms` durante 5 minutos.
- `p99` por ruta > `2000ms` durante 5 minutos.
- `GET /health` no disponible durante 2 comprobaciones consecutivas.

## Evidencia operativa (#31)

1. Recoger snapshot de salud + métricas desde entorno principal:

```bash
npm run ops:observability:evidence -- https://api.tu-dominio.com > docs/observability-evidence-YYYYMMDD.md
```

2. Validar semáforos en el reporte generado:

- `Error rate 5xx: OK`
- `Latencia p95: OK`
- `Latencia p99: OK`

3. Adjuntar el reporte al issue `#31` y enlazar dashboard/alertas.

Variables opcionales de umbral:

- `OBS_P95_LIMIT_MS` (default `1000`)
- `OBS_P99_LIMIT_MS` (default `2000`)
- `OBS_5XX_RATE_LIMIT` (default `0.02`)
- `OBS_TIMEOUT_MS` (default `10000`)

## Próximo paso recomendado

1. Ejecutar la captura de evidencia en entorno principal y cerrar el issue `#31`.
