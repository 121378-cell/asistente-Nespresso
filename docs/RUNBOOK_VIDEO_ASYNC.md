# Runbook Operativo - Workers Async (Fase 2)

Fecha: 19 de febrero de 2026

## Objetivo

Operar la capa async (video + identificación por imagen) sin dependencia directa de desarrollo, con detección temprana de atascos, fallos y crecimiento de DLQ.

## Métricas disponibles

Endpoint: `GET /metrics`

Bloques relevantes: `videoAsync` y `imageAsync`

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
- enqueue de job de imagen (`Image identification job enqueued`)
- ejecución worker de imagen (`Processing image identification`)
- reintentos de imagen (`Retrying image identification job`)
- movimiento a DLQ de imagen (`Moving image job to DLQ`)

## Dashboards mínimos

1. Cola y capacidad (video e imagen)

- `videoAsync.queueDepth`, `videoAsync.oldestQueuedAgeMs`, `videoAsync.runningJobs`
- `imageAsync.queueDepth`, `imageAsync.oldestQueuedAgeMs`, `imageAsync.runningJobs`

2. Estabilidad y errores (video e imagen)

- `videoAsync.retriesTotal`, `videoAsync.failedJobs`, `videoAsync.dlqSize`
- `imageAsync.retriesTotal`, `imageAsync.failedJobs`, `imageAsync.dlqSize`

3. Throughput (video e imagen)

- `videoAsync.throughputLast5m`, `videoAsync.throughputPerMinuteLast5m`
- `imageAsync.throughputLast5m`, `imageAsync.throughputPerMinuteLast5m`

## Alertas base recomendadas

1. Cola atascada

- Condición: `queueDepth > 20` por 10 minutos en `videoAsync` o `imageAsync`.
- Severidad: warning.

2. Latencia de cola alta

- Condición: `oldestQueuedAgeMs > 300000` (5 min) por 5 minutos en cualquier worker async.
- Severidad: critical.

3. DLQ creciendo

- Condición: `dlqSize > 0` en `videoAsync` o `imageAsync`.
- Severidad: warning inmediata.

4. Fallos/reintentos anómalos

- Condición: incremento de `failedJobs` > 5 en 10 min o ratio de reintentos elevado en cualquier worker async.
- Severidad: warning.

5. Throughput degradado

- Condición: `throughputLast5m = 0` con `queueDepth > 0` durante 10 minutos en `videoAsync` o `imageAsync`.
- Severidad: critical.

## Procedimiento de incidente

1. Confirmar estado general

- `GET /health`
- `GET /metrics` y revisar `videoAsync` e `imageAsync`.

2. Diagnóstico rápido

- Si `queueDepth` sube y `runningJobs = 0`: revisar logs de arranque/caída del worker correspondiente.
- Si `retriesTotal` crece rápido: revisar proveedor externo (timeouts/rate limit).
- Si `dlqSize > 0`: inspeccionar causa y decidir redrive o descarte.

3. Operación sobre DLQ

- Video:
  - Listar DLQ: `npm --prefix backend run video:dlq:list`
  - Redrive: `npm --prefix backend run video:dlq:redrive -- --jobId <job-uuid>`
- Imagen:
  - Listar DLQ: `GET /api/jobs/dlq` (autenticado) y revisar bloque `image`.
  - Redrive: `POST /api/jobs/redrive` con body `{"type":"image","jobId":"<job-uuid>"}`.

4. Verificación post-acción

- Validar que `queueDepth` y `oldestQueuedAgeMs` bajan.
- Validar en logs transición del `jobId` redriven a `completed`.

## Criterio de escalado

Escalar a desarrollo cuando:

- `dlqSize` sigue creciendo tras redrive de prueba.
- fallos no son transitorios (errores de validación o payload inválido sistemático).
- no hay progreso de throughput durante más de 30 minutos con cola activa.
