import { Page, expect } from '@playwright/test';

/**
 * Helpers para interactuar con la aplicación en tests E2E
 */

/**
 * Espera a que la aplicación cargue completamente
 */
export async function waitForAppLoad(page: Page) {
    // Esperar a que el header esté visible
    await expect(page.locator('h1:has-text("Asistente Nespresso")')).toBeVisible();

    // Esperar a que no haya spinners de carga
    await page.waitForLoadState('networkidle');
}

/**
 * Envía un mensaje en el chat
 */
export async function sendChatMessage(page: Page, message: string) {
    const input = page.locator('textarea[placeholder*="Escribe"]');
    const sendButton = page.locator('button[type="submit"]');

    await input.fill(message);
    await sendButton.click();
}

/**
 * Espera a que aparezca una respuesta del asistente
 */
export async function waitForAssistantResponse(page: Page, timeout = 30000) {
    // Esperar a que desaparezca el spinner de carga
    await page.waitForSelector('[class*="loading"]', {
        state: 'hidden',
        timeout
    });
}

/**
 * Abre un modal por nombre de botón
 */
export async function openModal(page: Page, buttonText: string) {
    await page.click(`button:has-text("${buttonText}")`);

    // Esperar a que el modal aparezca
    await page.waitForSelector('[class*="modal"]', { state: 'visible' });
}

/**
 * Cierra un modal
 */
export async function closeModal(page: Page) {
    const closeButton = page.locator('button:has-text("Cerrar")').first();
    await closeButton.click();

    // Esperar a que el modal desaparezca
    await page.waitForSelector('[class*="modal"]', { state: 'hidden' });
}

/**
 * Verifica que un elemento esté visible
 */
export async function expectVisible(page: Page, selector: string) {
    await expect(page.locator(selector)).toBeVisible();
}

/**
 * Verifica que un elemento no esté visible
 */
export async function expectNotVisible(page: Page, selector: string) {
    await expect(page.locator(selector)).not.toBeVisible();
}

/**
 * Cuenta el número de mensajes en el chat
 */
export async function getMessageCount(page: Page): Promise<number> {
    const messages = page.locator('[class*="message"]');
    return await messages.count();
}

/**
 * Obtiene el texto del último mensaje
 */
export async function getLastMessage(page: Page): Promise<string> {
    const messages = page.locator('[class*="message"]');
    const count = await messages.count();

    if (count === 0) {
        return '';
    }

    return await messages.nth(count - 1).textContent() || '';
}

/**
 * Selecciona un problema de la base de conocimientos
 */
export async function selectKnowledgeBaseProblem(page: Page, problemText: string) {
    await page.click(`text=${problemText}`);
}
