# Runbook Operativo - Video Async (Fase 2)

Fecha: 19 de febrero de 2026

## Objetivo

Operar la cola y el worker de video sin dependencia directa de desarrollo, con detección temprana de atascos, fallos y crecimiento de DLQ.

## Métricas disponibles

Endpoint: `GET /metrics`

Bloque relevante: `videoAsync`

- `queueDepth`: jobs en `queued`.
- `oldestQueuedAgeMs`: edad del job en cola más antiguo.
- `runningJobs`: jobs en `running`.
- `completedJobs`: total histórico en `completed`.
- `failedJobs`: total histórico en `failed`.
- `retriesTotal`: reintentos acumulados (`attempts - 1`).
- `throughputLast5m`: jobs completados en últimos 5 minutos.
- `throughputPerMinuteLast5m`: throughput promedio por minuto (ventana 5m).
- `dlqSize`: tamaño de dead-letter queue.

## Correlación operativa

Logs estructurados incluyen `requestId` y `jobId` para:

- enqueue de job (`Video job enqueued`)
- consulta de estado (`Video job status requested`)
- ejecución worker (`Processing video job`)
- reintentos con backoff (`Retrying video job with exponential backoff`)
- movimiento a DLQ (`Moving video job to DLQ`)

## Dashboards mínimos

1. Cola y capacidad

- `videoAsync.queueDepth`
- `videoAsync.oldestQueuedAgeMs`
- `videoAsync.runningJobs`

2. Estabilidad y errores

- `videoAsync.retriesTotal` (derivada por intervalo)
- `videoAsync.failedJobs` (derivada por intervalo)
- `videoAsync.dlqSize`

3. Throughput

- `videoAsync.throughputLast5m`
- `videoAsync.throughputPerMinuteLast5m`

## Alertas base recomendadas

1. Cola atascada

- Condición: `queueDepth > 20` por 10 minutos.
- Severidad: warning.

2. Latencia de cola alta

- Condición: `oldestQueuedAgeMs > 300000` (5 min) por 5 minutos.
- Severidad: critical.

3. DLQ creciendo

- Condición: `dlqSize > 0`.
- Severidad: warning inmediata.

4. Fallos/reintentos anómalos

- Condición: incremento de `failedJobs` > 5 en 10 min o ratio de reintentos elevado.
- Severidad: warning.

5. Throughput degradado

- Condición: `throughputLast5m = 0` con `queueDepth > 0` durante 10 minutos.
- Severidad: critical.

## Procedimiento de incidente

1. Confirmar estado general

- `GET /health`
- `GET /metrics` y revisar `videoAsync`.

2. Diagnóstico rápido

- Si `queueDepth` sube y `runningJobs = 0`: revisar logs de arranque/caída del worker.
- Si `retriesTotal` crece rápido: revisar proveedor externo (timeouts/rate limit).
- Si `dlqSize > 0`: inspeccionar causa y decidir redrive o descarte.

3. Operación sobre DLQ

- Listar DLQ:
  - `npm --prefix backend run video:dlq:list`
- Re-drive de un job:
  - `npm --prefix backend run video:dlq:redrive -- --jobId <job-uuid>`

4. Verificación post-acción

- Validar que `queueDepth` y `oldestQueuedAgeMs` bajan.
- Validar en logs transición del `jobId` redriven a `completed`.

## Criterio de escalado

Escalar a desarrollo cuando:

- `dlqSize` sigue creciendo tras redrive de prueba.
- fallos no son transitorios (errores de validación o payload inválido sistemático).
- no hay progreso de throughput durante más de 30 minutos con cola activa.
