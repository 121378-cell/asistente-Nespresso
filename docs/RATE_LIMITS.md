# Política de Rate Limits por Endpoint

Fecha: 24 de febrero de 2026

## Matriz de límites

- Global (`/api/*`): `100 req / 15 min` por IP.
- Auth (`/api/auth/register`, `/api/auth/login`): `10 req / 15 min`.
- Chat IA (`/api/chat`, `/api/chat/identify-machine`, `/api/chat/identify-machine/async`): `30 req / 15 min`.
- Estado async (`/api/video/status`, `/api/chat/identify-machine/status/:jobId`): `120 req / 1 min`.
- Video generate (`/api/video/generate`): `5 req / 1 h`.
- Analytics/Write (`/api/analytics/search`, `/api/analytics/export`, `/api/analytics/query`, `POST/PUT/DELETE` de repairs, `/api/jobs/redrive`): `50 req / 15 min`.
- Read (`GET` de `repairs`, `analytics` de lectura, `jobs/metrics`, `jobs/dlq`): `200 req / 15 min`.

## Criterio de coste aplicado

- Muy alto coste: generación de video => límite más estricto.
- Coste alto por abuso: autenticación => límite bajo anti-bruteforce.
- Polling operativo: estados async => ventana corta con tope alto controlado.
- Lectura de dashboard/listados: límite amplio pero no ilimitado.
- Operaciones de escritura/consulta pesada: límite moderado.

## Verificación rápida

1. Ejecutar backend:
   - `npm --prefix backend run dev`
2. Forzar exceso por endpoint y validar `429`.
3. Confirmar cabeceras estándar de rate limit (`RateLimit-*`) en respuestas.
