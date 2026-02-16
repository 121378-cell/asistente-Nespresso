import { test, expect } from '@playwright/test';
import { waitForAppLoad } from './helpers/page-helpers';
import { selectors } from './fixtures/test-data';

async function closeOverlay(page: import('@playwright/test').Page) {
  await page
    .locator('div.fixed.inset-0')
    .first()
    .click({ position: { x: 8, y: 8 } });
}

test.describe('Modales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('debe abrir y cerrar el modal de generación de video', async ({ page }) => {
    // Abrir modal
    await page.click(selectors.header.videoButton);

    await expect(
      page.getByText(/se requiere una api key|generar vídeo con veo/i).first()
    ).toBeVisible();
    await closeOverlay(page);
    await expect(page.getByText(/se requiere una api key|generar vídeo con veo/i)).toHaveCount(0);
  });

  test('debe abrir y cerrar el modal de reparaciones guardadas', async ({ page }) => {
    // Abrir modal
    await page.click(selectors.header.repairsButton);
    await expect(page.getByRole('heading', { name: /reparaciones guardadas/i })).toBeVisible();
    await closeOverlay(page);
    await expect(page.getByRole('heading', { name: /reparaciones guardadas/i })).toHaveCount(0);
  });

  test('debe abrir y cerrar el modal de base de datos', async ({ page }) => {
    // Abrir modal
    await page.click(selectors.header.databaseButton);
    await expect(page.getByRole('heading', { name: /base de datos/i })).toBeVisible();
    await closeOverlay(page);
    await expect(page.getByRole('heading', { name: /base de datos/i })).toHaveCount(0);
  });

  test('debe cerrar modales al presionar ESC', async ({ page }) => {
    // Abrir modal de video
    await page.click(selectors.header.videoButton);
    await expect(
      page.getByText(/se requiere una api key|generar vídeo con veo/i).first()
    ).toBeVisible();

    // Presionar ESC
    await page.keyboard.press('Escape');

    // Verificar cierre
    await expect(page.getByText(/se requiere una api key|generar vídeo con veo/i)).toHaveCount(0);
  });

  test('debe permitir abrir diferentes modales secuencialmente', async ({ page }) => {
    // Abrir modal de video
    await page.click(selectors.header.videoButton);
    await expect(
      page.getByText(/se requiere una api key|generar vídeo con veo/i).first()
    ).toBeVisible();
    await closeOverlay(page);

    // Abrir modal de reparaciones
    await page.click(selectors.header.repairsButton);
    await expect(page.getByRole('heading', { name: /reparaciones guardadas/i })).toBeVisible();
    await closeOverlay(page);
  });
});
