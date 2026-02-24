# Tests E2E con Playwright

Este directorio contiene los tests end-to-end (E2E) para el Asistente Nespresso usando Playwright.

## 📁 Estructura

```
e2e/
├── fixtures/
│   └── test-data.ts          # Datos de prueba y selectores
├── helpers/
│   └── page-helpers.ts       # Funciones auxiliares para tests
├── 01-navigation.spec.ts     # Tests de navegación básica
├── 02-chat-flow.spec.ts      # Tests del flujo de chat
├── 03-modals.spec.ts         # Tests de modales
├── 04-repairs.spec.ts        # Tests de reparaciones
├── 05-camera-identification.spec.ts  # Tests de cámara
└── 06-video-async.spec.ts    # E2E flujo async de video (happy path + retry)
```

## 🚀 Ejecutar Tests

### Modo Headless (por defecto)

```bash
npm run test:e2e
```

### Modo UI Interactivo

```bash
npm run test:e2e:ui
```

### Modo Headed (con navegador visible)

```bash
npm run test:e2e:headed
```

### Modo Debug

```bash
npm run test:e2e:debug
```

### Generar Tests Automáticamente

```bash
npm run test:e2e:codegen
```

## 📝 Escribir Nuevos Tests

### Estructura Básica

```typescript
import { test, expect } from '@playwright/test';
import { waitForAppLoad } from './helpers/page-helpers';

test.describe('Mi Suite de Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('debe hacer algo específico', async ({ page }) => {
    // Tu código de test aquí
  });
});
```

### Helpers Disponibles

- `waitForAppLoad(page)` - Espera a que la app cargue
- `sendChatMessage(page, message)` - Envía un mensaje en el chat
- `waitForAssistantResponse(page)` - Espera respuesta del asistente
- `openModal(page, buttonText)` - Abre un modal
- `closeModal(page)` - Cierra un modal
- `getMessageCount(page)` - Cuenta mensajes en el chat
- `getLastMessage(page)` - Obtiene el último mensaje

### Datos de Prueba

Los datos de prueba están en `fixtures/test-data.ts`:

```typescript
import { testData, selectors } from './fixtures/test-data';

// Usar datos de prueba
await sendChatMessage(page, testData.chatMessages.greeting);

// Usar selectores
await page.click(selectors.header.videoButton);
```

## ⚠️ Consideraciones Importantes

### Backend Requerido

Algunos tests requieren que el backend esté corriendo:

```bash
cd backend
npm run dev
```

Los tests de chat y reparaciones necesitan conexión a la API.

### Tests Lentos

Los tests que involucran la API de Gemini pueden tardar hasta 60 segundos. Esto es normal.

### Tests Skipped

Algunos tests están marcados como `.skip()` porque requieren:

- Base de datos con datos de prueba
- Permisos de cámara
- Configuración adicional

Puedes implementarlos cuando tengas el entorno adecuado.

## 🐛 Troubleshooting

### "Error: page.goto: net::ERR_CONNECTION_REFUSED"

El servidor de desarrollo no está corriendo. Playwright lo inicia automáticamente, pero si ves este error:

```bash
# En una terminal separada
npm run dev
```

### "Test timeout of 30000ms exceeded"

Los tests de chat pueden tardar más. Ya están configurados con timeouts de 60s, pero si sigues viendo el error:

1. Verifica que tu API key de Gemini sea válida
2. Verifica tu conexión a internet
3. Revisa los logs del backend

### "locator.click: Target closed"

El elemento desapareció antes de hacer clic. Añade un `waitForTimeout`:

```typescript
await page.waitForTimeout(500);
await element.click();
```

## 📊 Reportes

Después de ejecutar los tests, puedes ver el reporte HTML:

```bash
npx playwright show-report
```

Los screenshots y videos de tests fallidos están en:

- `test-results/` - Screenshots y videos
- `playwright-report/` - Reporte HTML

## 🔄 CI/CD

Los tests E2E se ejecutan automáticamente en **GitHub Actions** en cada push y pull request.

### Workflow Automático

El workflow (`.github/workflows/e2e-tests.yml`) hace lo siguiente:

1. ✅ Instala Node.js y dependencias
2. ✅ Instala navegadores de Playwright
3. ✅ Ejecuta todos los tests E2E
4. ✅ Sube reportes como artifacts si hay fallos

Además, el workflow de quality gates (`.github/workflows/quality-gates.yml`) ejecuta en smoke:

- `e2e/01-navigation.spec.ts`
- `e2e/06-video-async.spec.ts`

### Ver Resultados en GitHub

1. Ve a la pestaña **Actions** en tu repositorio de GitHub
2. Selecciona el workflow "E2E Tests"
3. Haz clic en una ejecución para ver los detalles
4. Si hay fallos, descarga los artifacts (screenshots, videos, reportes)

### Descargar Artifacts

Si los tests fallan en CI, puedes descargar:

- `playwright-report` - Reporte HTML completo
- `test-results` - Screenshots y videos de los fallos

Los artifacts están disponibles por 30 días.

## 🔧 Configuración

La configuración está en `playwright.config.ts` en la raíz del proyecto.

### Cambiar Navegadores

Por defecto solo se usa Chromium. Para añadir más navegadores, descomenta en `playwright.config.ts`:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } }, // Descomentar
  { name: 'webkit', use: { ...devices['Desktop Safari'] } }, // Descomentar
];
```

### Cambiar Puerto

Si tu app corre en otro puerto, actualiza en `playwright.config.ts`:

```typescript
use: {
  baseURL: 'http://localhost:3000',  // Cambiar aquí
}
```

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)
- [Selectors](https://playwright.dev/docs/selectors)
