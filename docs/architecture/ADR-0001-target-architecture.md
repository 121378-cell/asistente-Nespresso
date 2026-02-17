# ADR-0001: Arquitectura objetivo v1

Fecha: 17 de febrero de 2026  
Estado: Aprobado (v1)

## Contexto

El proyecto ya cubre flujos críticos (chat, reparaciones, cámara, video) pero aún opera con una topología simple para cargas de trabajo mixtas. Para escalar sin degradar latencia ni coste, se define una arquitectura objetivo modular con separación explícita de responsabilidades.

## Decisión

Adoptar una arquitectura por componentes:

1. Web App (Frontend)

- UI React/Vite.
- Consume API síncrona (REST) y consulta estado de jobs asíncronos.
- No contiene secretos.

2. API Gateway/App API (Backend HTTP)

- Endpoints síncronos de negocio y orquestación.
- Autenticación/autorización, validación, rate limiting, auditoría.
- Publica jobs a cola para tareas costosas.

3. Workers (procesamiento asíncrono)

- Ejecutan tareas de alto coste/latencia (video, análisis de imagen, procesos batch).
- Idempotencia por `jobId` y reintentos con backoff.

4. Cola de trabajos

- Buffer desacoplado entre API y Workers.
- Soporta retry, dead-letter queue (DLQ), métricas de cola.

5. Persistencia

- Base transaccional (estado de negocio).
- Almacenamiento de objetos (adjuntos/imágenes/videos).
- Modelo de datos preparado para multi-tenant.

## Límites de dominio y contratos

1. Dominio `Chat & Asistencia`

- API: `POST /api/chat`, `POST /api/chat/identify-machine`.
- Contrato: request validado, respuesta con `requestId` y payload de respuesta IA.

2. Dominio `Repairs`

- API: CRUD `/api/repairs`.
- Contrato: entidad `SavedRepair` versionada; operaciones idempotentes cuando aplique.

3. Dominio `Analytics`

- API: `/api/analytics/*`.
- Contrato: solo consultas predefinidas (sin SQL arbitrario desde cliente).

4. Dominio `Video`

- API síncrona: `POST /api/video/generate` (acepta solicitud y encola).
- API estado: `POST /api/video/status` (consulta progreso/resultado).
- Contrato async: `VideoJobRequested`, `VideoJobCompleted`, `VideoJobFailed`.

## Decisiones y trade-offs

1. Mantener REST sobre introducir gRPC/event streaming ahora.

- Pro: menor complejidad de adopción.
- Contra: menos eficiencia para streaming en tiempo real.

2. Cola + workers para tareas costosas.

- Pro: protege latencia p95 de API y mejora resiliencia.
- Contra: requiere observabilidad de jobs y manejo de idempotencia.

3. Evolución incremental sobre reescritura total.

- Pro: reduce riesgo operacional.
- Contra: coexistencia temporal de caminos síncronos/asíncronos.

4. Seguridad “fail fast” en configuración.

- Pro: evita despliegues inseguros en producción.
- Contra: mayor fricción en setup inicial.

## Plan de migración incremental (sin big-bang)

Fase A (actual, completada en gran parte)

- Observabilidad base (`/metrics`, `requestId`, logging estructurado).
- Security baseline (validación env, headers, auditoría de dependencias).
- Quality gates CI/CD.

Fase B (siguiente)

- Introducir cola y worker para `Video`.
- Persistir estado de job (`queued`, `running`, `failed`, `completed`).
- Reintentos automáticos + DLQ.

Fase C

- Extender async a análisis de imagen pesado y procesos batch.
- Introducir partición lógica por tenant en datos y límites por tenant.

Fase D

- Optimización de costes IA (cache semántica, cuotas, fallback de modelo).
- Exponer webhooks/eventos para integraciones externas.

## Riesgos y mitigaciones

1. Riesgo: duplicación de procesamiento en reintentos.

- Mitigación: idempotency keys y deduplicación por `jobId`.

2. Riesgo: inconsistencias entre estado de job y estado de negocio.

- Mitigación: transacciones de actualización de estado + reconciliación periódica.

3. Riesgo: aumento de complejidad operativa.

- Mitigación: SLOs por componente, dashboards por dominio y runbooks.

4. Riesgo: lock-in de proveedor.

- Mitigación: contratos internos neutrales para cola/almacenamiento y adapters.

## Criterios de éxito

1. API síncrona estable con p95 controlado bajo carga mixta.
2. Tareas pesadas fuera del camino crítico HTTP.
3. Fallos de workers no impactan disponibilidad de API.
4. Escalado horizontal independiente de API y workers.
