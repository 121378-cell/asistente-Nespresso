# 📋 Backlog de Desarrollo - Asistente Nespresso

Este documento registra las tareas pendientes y el progreso del proyecto hacia la arquitectura modular (Fase B/C).

## 🚀 Próximas Tareas (Prioridad Alta)

- [x] **Tarea 1: Resiliencia en Procesamiento de Video**
  - [x] Implementar reintentos con Backoff exponencial en `videoJobWorker.ts`.
  - [x] Implementar lógica de Dead Letter Queue (DLQ) para trabajos fallidos tras agotar reintentos.
- [x] **Tarea 2: Mejora de Persistencia y UI de Jobs**
  - [x] Asegurar que el estado del job sea consultable desde el frontend de forma reactiva.
  - [x] Mostrar alertas claras en la UI cuando un video falla o entra en reintento.

## 🛠️ Evolución Arquitectónica (Prioridad Media)

- [x] **Tarea 3: Migración Async de Identificación de Imágenes**
  - [x] Desacoplar el análisis de fotos pesado de la solicitud HTTP síncrona.
- [x] **Tarea 4: Optimización de Costes IA**
  - [x] Implementar caché semántica para consultas frecuentes a Gemini.

## 🔒 Seguridad y Funcionalidad (Prioridad Baja)

- [x] **Tarea 5: Autenticación**
  - [x] Implementar sistema de login/JWT para proteger datos de reparaciones.
- [x] **Tarea 6: Generación de Reportes**
  - [x] Exportación de reparaciones a PDF.

---

_Nota: Este archivo se actualiza tras cada hito completado y commit realizado._
