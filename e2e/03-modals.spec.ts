import { test, expect } from '@playwright/test';
import { waitForAppLoad, openModal, closeModal } from './helpers/page-helpers';
import { selectors } from './fixtures/test-data';

test.describe('Modales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('debe abrir y cerrar el modal de generación de video', async ({ page }) => {
    // Abrir modal
    await page.click(selectors.header.videoButton);

    // Esperar a que el modal aparezca
    await page.waitForTimeout(1000);

    // Verificar que el modal está visible
    const modal = page.locator('[class*="modal"]').first();
    await expect(modal).toBeVisible();

    // Cerrar modal
    const closeButton = page
      .locator('button')
      .filter({ hasText: /cerrar|×|close/i })
      .first();
    await closeButton.click();

    // Esperar a que el modal desaparezca
    await page.waitForTimeout(500);
  });

  test('debe abrir y cerrar el modal de reparaciones guardadas', async ({ page }) => {
    // Abrir modal
    await page.click(selectors.header.repairsButton);

    // Esperar a que el modal aparezca
    await page.waitForTimeout(1000);

    // Verificar que el modal está visible
    const modal = page.locator('[class*="modal"]').first();
    await expect(modal).toBeVisible();

    // Cerrar modal
    const closeButton = page
      .locator('button')
      .filter({ hasText: /cerrar|×|close/i })
      .first();
    await closeButton.click();

    // Esperar a que el modal desaparezca
    await page.waitForTimeout(500);
  });

  test('debe abrir y cerrar el modal de base de datos', async ({ page }) => {
    // Abrir modal
    await page.click(selectors.header.databaseButton);

    // Esperar a que el modal aparezca
    await page.waitForTimeout(1000);

    // Verificar que el modal está visible
    const modal = page.locator('[class*="modal"]').first();
    await expect(modal).toBeVisible();

    // Cerrar modal
    const closeButton = page
      .locator('button')
      .filter({ hasText: /cerrar|×|close/i })
      .first();
    await closeButton.click();

    // Esperar a que el modal desaparezca
    await page.waitForTimeout(500);
  });

  test('debe cerrar modales al presionar ESC', async ({ page }) => {
    // Abrir modal de video
    await page.click(selectors.header.videoButton);
    await page.waitForTimeout(1000);

    // Verificar que está visible
    const modal = page.locator('[class*="modal"]').first();
    await expect(modal).toBeVisible();

    // Presionar ESC
    await page.keyboard.press('Escape');

    // Esperar y verificar que se cerró
    await page.waitForTimeout(500);

    // Verificar que no hay modales visibles
    const modalCount = await page.locator('[class*="modal"]').count();
    // Si hay modales, verificar que no están visibles
    if (modalCount > 0) {
      const isVisible = await modal.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    }
  });

  test('debe permitir abrir diferentes modales secuencialmente', async ({ page }) => {
    // Abrir modal de video
    await page.click(selectors.header.videoButton);
    await page.waitForTimeout(1000);

    // Cerrar
    let closeButton = page
      .locator('button')
      .filter({ hasText: /cerrar|×|close/i })
      .first();
    await closeButton.click();
    await page.waitForTimeout(500);

    // Abrir modal de reparaciones
    await page.click(selectors.header.repairsButton);
    await page.waitForTimeout(1000);

    // Verificar que está visible
    const modal = page.locator('[class*="modal"]').first();
    await expect(modal).toBeVisible();

    // Cerrar
    closeButton = page
      .locator('button')
      .filter({ hasText: /cerrar|×|close/i })
      .first();
    await closeButton.click();
    await page.waitForTimeout(500);
  });
});
