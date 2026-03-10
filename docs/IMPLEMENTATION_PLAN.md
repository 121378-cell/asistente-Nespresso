# 📋 Plan de Implementación de Mejoras - Asistente Nespresso

Este plan detalla la ejecución segura y eficiente de las mejoras identificadas en `FUTURE_IMPROVEMENTS.md`. Se seguirá una metodología de **Cambio Atómico -> Validación -> Confirmación**.

---

## Fase 1: Cimientos y Resiliencia (Offline First)

_Prioridad: Alta | Riesgo: Medio_

### 1.1 Migración a IndexedDB (Dexie.js)

- [ ] Instalar `dexie` y `dexie-react-hooks`.
- [ ] Crear esquema de base de datos local (Reparaciones, Mensajes, Metadatos).
- [ ] Implementar capa de servicio `db.ts`.
- [ ] Refactorizar `useRepairs` para usar IndexedDB como fuente primaria.
- **Validación**: Verificar persistencia tras cerrar el navegador y capacidad de almacenar >5MB.

### 1.2 Estrategia PWA Robusta

- [ ] Instalar `vite-plugin-pwa`.
- [ ] Configurar Service Worker con estrategia `Stale-While-Revalidate`.
- [ ] Implementar aviso de "Nueva versión disponible".
- **Validación**: Carga de la aplicación en modo avión (Chrome DevTools -> Offline).

---

## Fase 2: Precisión Técnica y Datos

_Prioridad: Alta | Riesgo: Bajo_

### 2.1 Validación de Rangos de Seguridad

- [ ] Definir rangos nominales (mín/máx) en `checklistData.ts` para presión y temperatura.
- [ ] Actualizar componente `Checklist` para mostrar alertas visuales (color rojo) si el valor está fuera de rango.
- **Validación**: Introducir 100ºC en Zenius y verificar que el campo cambia a color de advertencia.

### 2.2 Relación Modelo-Pieza (Prisma)

- [ ] Actualizar `schema.prisma` para añadir relación muchos-a-muchos entre `SparePart` y `MachineModel`.
- [ ] Ejecutar migración controlada.
- [ ] Actualizar script de importación de Excel.
- **Validación**: Seleccionar Zenius y verificar que solo aparecen piezas de ZN100 en el buscador.

---

## Fase 3: Inteligencia y Visión Local

_Prioridad: Media | Riesgo: Medio_

### 3.1 Integración de Visión con Ollama (Llava)

- [ ] Configurar endpoint de visión en el backend.
- [ ] Actualizar `aiService.ts` para enviar imágenes a `llava`.
- [ ] Habilitar de nuevo el botón de cámara en la UI.
- **Validación**: Subir foto de una Zenius y recibir identificación correcta desde el modelo local.

### 3.2 Dictado de Notas (Speech-to-Text)

- [ ] Implementar integración con la Web Speech API.
- [ ] Añadir icono de micrófono en los campos de texto de notas.
- **Validación**: Grabar voz y verificar transcripción en el campo de "Resolución Final".

---

## Fase 4: Firma y Formalización

_Prioridad: Media | Riesgo: Bajo_

### 4.1 Firma Digital del Cliente

- [ ] Instalar `react-signature-canvas`.
- [ ] Añadir modal de firma al final del flujo de guardado.
- [ ] Incluir la imagen de la firma en la exportación a Word/PDF.
- **Validación**: Realizar firma táctil y verificar su aparición en el documento generado.

---

## 🛡️ Protocolo de Seguridad en el Desarrollo

Para cada tarea del plan, se seguirá estrictamente:

1.  **Aislamiento**: Crear una rama o entorno de prueba para la función.
2.  **Smoke Test**: Ejecutar `npm run test:e2e` para asegurar que el flujo básico sigue vivo.
3.  **Build Check**: Ejecutar `npm run build` para descartar errores de tipos o dependencias.
4.  **Limpieza**: Borrar logs de depuración y scripts temporales antes de cada commit.

---

_Plan generado el 5 de marzo de 2026_
