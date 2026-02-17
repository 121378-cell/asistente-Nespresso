# Observabilidad Baseline

Fecha: 17 de febrero de 2026

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

## Próximo paso recomendado

1. Conectar `GET /metrics` a un dashboard (Grafana/Datadog) y definir alertas mínimas sobre `p95` y tasa de `5xx`.
