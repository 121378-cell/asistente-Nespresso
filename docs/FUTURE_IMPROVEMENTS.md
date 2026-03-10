# 🚀 Hoja de Ruta de Mejoras - Asistente Nespresso

Este documento detalla las mejoras sugeridas para evolucionar la aplicación desde un prototipo funcional a una herramienta profesional de grado empresarial para técnicos de campo.

---

## 1. 📶 Capacidades Offline y Resiliencia

_Objetivo: Garantizar que el técnico nunca pierda información, incluso en zonas sin cobertura._

- [ ] **Migración a IndexedDB**: Sustituir `localStorage` por `IndexedDB` (usando Dexie.js) para permitir el almacenamiento de grandes volúmenes de datos y archivos adjuntos (fotos) de forma local.
- [ ] **Estrategia PWA Avanzada**: Implementar un Service Worker con estrategia "Cache-First" para activos estáticos y "Network-First" para datos de la API.
- [ ] **Cola de Sincronización (Background Sync)**: Sistema automático que detecta la recuperación de conexión y sube los partes pendientes a la base de datos PostgreSQL de forma transparente.

## 2. 🤖 Inteligencia Artificial y Visión

_Objetivo: Proporcionar asistencia técnica avanzada mediante modelos locales y multimodales._

- [ ] **Visión Local con Ollama (Llava)**: Implementar identificación de componentes y lectura de códigos de error mediante fotos procesadas localmente en el host (útil si no hay acceso a APIs externas).
- [ ] **Dictado de Notas (Speech-to-Text)**: Función de manos libres para que el técnico dicte la resolución del parte mientras manipula la máquina.
- [ ] **RAG de Diagramas**: Integrar esquemas de despiece (exploded views) en el sistema de recuperación de conocimiento para mostrar visualmente dónde va cada pieza.

## 3. 🛠️ Gestión Técnica y de Inventario

_Objetivo: Refinar el control de materiales y la precisión de las mediciones._

- [ ] **Relación Modelo-Pieza**: Vincular el inventario de recambios con modelos específicos de cafetera para filtrar automáticamente las piezas compatibles.
- [ ] **Validación de Rangos de Seguridad**: Alertas visuales inmediatas si los valores manuales (Presión/Temperatura) están fuera de los parámetros nominales del fabricante.
- [ ] **Firma Digital**: Campo de firma en pantalla para que el cliente valide el trabajo realizado antes de cerrar el parte.

## 4. 📈 Análisis y Reportes

_Objetivo: Transformar los datos recolectados en información estratégica._

- [ ] **Dashboard de Fiabilidad**: Estadísticas sobre las averías más comunes por modelo y región.
- [ ] **Exportación Masiva**: Generación de informes consolidados en Excel/CSV por rango de fechas para facilitar la facturación.
- [ ] **Integración con ERP**: APIs para conectar el sistema con software de gestión de almacén o facturación externo.

## 5. 🎨 UX y Accesibilidad

_Objetivo: Optimizar la aplicación para el uso intensivo en dispositivos móviles._

- [ ] **Optimización de Modo Oscuro**: Refinar el contraste y colores en todas las pantallas para maximizar el ahorro de batería en pantallas OLED.
- [ ] **Navegación por Gestos**: Facilitar el cambio entre el chat, el checklist y el inventario mediante deslizamientos laterales.
- [ ] **Feedback Háptico**: Vibraciones cortas al completar tareas del checklist para confirmar acciones sin necesidad de mirar la pantalla.

---

_Documento generado el 5 de marzo de 2026_
