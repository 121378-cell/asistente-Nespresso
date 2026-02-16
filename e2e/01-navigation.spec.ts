import { test, expect } from '@playwright/test';
import { waitForAppLoad } from './helpers/page-helpers';
import { selectors } from './fixtures/test-data';

test.describe('Navegación Básica', () => {
  test('debe cargar la aplicación correctamente', async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);

    // Verificar que el título esté presente
    await expect(page.locator(selectors.header.title)).toBeVisible();
    await expect(page.locator(selectors.header.title)).toContainText(/asistente/i);
    await expect(page.locator(selectors.header.title)).toContainText(/nespresso/i);
  });

  test('debe mostrar todos los botones principales en el header', async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);

    // Verificar botones principales
    await expect(page.locator(selectors.header.videoButton)).toBeVisible();
    await expect(page.locator(selectors.header.repairsButton)).toBeVisible();
    await expect(page.locator(selectors.header.databaseButton)).toBeVisible();
  });

  test('debe mostrar la base de conocimientos en la pantalla inicial', async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);

    // Verificar que la base de conocimientos esté visible
    const knowledgeBase = page.locator('h2:has-text("Base de Conocimiento")');
    await expect(knowledgeBase).toBeVisible();

    // Verificar que haya contenido en la página
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('debe tener el input de chat visible', async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);

    // Verificar que el input de chat esté presente
    await expect(page.locator(selectors.chat.input)).toBeVisible();
  });

  test('debe ser responsive y mostrar el layout correcto', async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);

    // Verificar que el layout principal esté presente
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main').or(page.locator('[class*="chat"]'))).toBeVisible();
    await expect(page.locator('footer').or(page.locator('[class*="input"]'))).toBeVisible();
  });
});
