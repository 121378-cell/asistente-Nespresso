import { test, expect } from '@playwright/test';
import { waitForAppLoad } from './helpers/page-helpers';
import { testData, selectors } from './fixtures/test-data';

test.describe('Funcionalidad de Reparaciones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('debe abrir el modal de reparaciones guardadas', async ({ page }) => {
    // Abrir modal de reparaciones
    await page.click(selectors.header.repairsButton);

    // Esperar a que cargue
    await page.waitForTimeout(1000);

    // Verificar que el modal está visible
    const modal = page.locator('[class*="modal"]').first();
    await expect(modal).toBeVisible();
  });

  test('debe mostrar la lista de reparaciones (si existen)', async ({ page }) => {
    // Abrir modal de reparaciones
    await page.click(selectors.header.repairsButton);
    await page.waitForTimeout(1000);

    // Verificar que hay contenido en el modal
    const modal = page.locator('[class*="modal"]').first();
    const modalText = await modal.textContent();

    // Debería tener algún texto (lista vacía o con reparaciones)
    expect(modalText).toBeTruthy();
    expect(modalText!.length).toBeGreaterThan(0);
  });

  test('debe tener un botón para guardar nueva reparación', async ({ page }) => {
    // Abrir modal de reparaciones
    await page.click(selectors.header.repairsButton);
    await page.waitForTimeout(1000);

    // Buscar botón de guardar (puede tener diferentes textos)
    const saveButton = page
      .locator('button')
      .filter({
        hasText: /guardar|save|nueva/i,
      })
      .first();

    // Verificar que existe (puede estar deshabilitado si no hay conversación)
    const buttonExists = (await saveButton.count()) > 0;
    expect(buttonExists).toBeTruthy();
  });

  test('debe permitir cerrar el modal de reparaciones', async ({ page }) => {
    // Abrir modal
    await page.click(selectors.header.repairsButton);
    await page.waitForTimeout(1000);

    // Cerrar modal
    const closeButton = page
      .locator('button')
      .filter({
        hasText: /cerrar|×|close/i,
      })
      .first();
    await closeButton.click();

    // Esperar a que desaparezca
    await page.waitForTimeout(500);

    // Verificar que no hay modales visibles
    const modalCount = await page.locator('[class*="modal"]:visible').count();
    expect(modalCount).toBe(0);
  });

  test.skip('debe guardar una reparación con datos válidos', async ({ page }) => {
    // Este test requiere tener una conversación activa primero
    // Se marca como skip porque depende del flujo completo
    // TODO: Implementar cuando se tenga el flujo completo
    // 1. Iniciar conversación
    // 2. Identificar modelo
    // 3. Guardar reparación
    // 4. Verificar que aparece en la lista
  });

  test.skip('debe cargar una reparación existente', async ({ page }) => {
    // Este test requiere tener reparaciones guardadas
    // Se marca como skip porque depende de datos existentes
    // TODO: Implementar con datos de prueba en la BD
    // 1. Abrir modal de reparaciones
    // 2. Seleccionar una reparación
    // 3. Verificar que se carga en el chat
  });

  test.skip('debe eliminar una reparación', async ({ page }) => {
    // Este test requiere tener reparaciones guardadas
    // Se marca como skip porque depende de datos existentes
    // TODO: Implementar con datos de prueba en la BD
    // 1. Abrir modal de reparaciones
    // 2. Eliminar una reparación
    // 3. Verificar que desaparece de la lista
  });
});
