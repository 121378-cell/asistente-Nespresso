# Checklist de validación PWA (Android/iOS)

Fecha: 24 de febrero de 2026

## Alcance

Verificar que el `manifest`, los iconos y el flujo base de instalación estén correctamente configurados para navegadores móviles.

## Evidencia técnica aplicada

- Manifest disponible en `public/manifest.json` con:
  - `id`, `start_url`, `scope`, `display`, `theme_color`, `background_color`.
  - Iconos reales: `/icon-192.png` y `/icon-512.png`.
  - Screenshot real: `/screenshot.png`.
- Registro de Service Worker corregido a `'/sw.js'` en `index.tsx`.
- Service Worker cachea recursos PWA críticos (`manifest` + iconos + screenshot) en `public/sw.js`.

## Checklist Android (Chrome)

- [x] `manifest.json` accesible sin errores.
- [x] Iconos `192x192` y `512x512` existentes.
- [x] Service Worker registra sin ruta rota.
- [x] Build frontend en verde (`npm run build`).

## Checklist iOS (Safari)

- [x] `apple-touch-icon` configurado en `index.html`.
- [x] Meta tags Apple (`apple-mobile-web-app-*`) presentes.
- [x] Icono referenciado (`/icon-192.png`) existente.

## Comandos de validación ejecutados

```bash
npm run build
npm run test:run
```
