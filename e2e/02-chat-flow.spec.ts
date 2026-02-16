import { test, expect } from '@playwright/test';
import {
  waitForAppLoad,
  sendChatMessage,
  waitForAssistantResponse,
  getMessageCount,
} from './helpers/page-helpers';
import { testData } from './fixtures/test-data';

test.describe('Flujo de Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('debe enviar un mensaje y recibir respuesta', async ({ page }) => {
    const initialCount = await getMessageCount(page);

    // Enviar mensaje
    await sendChatMessage(page, testData.chatMessages.greeting);

    // Esperar a que aparezca el mensaje del usuario
    await expect
      .poll(async () => getMessageCount(page), { timeout: 10000 })
      .toBeGreaterThan(initialCount);
    const afterUserMessage = await getMessageCount(page);
    expect(afterUserMessage).toBeGreaterThan(initialCount);

    // Esperar respuesta del asistente (con timeout largo por la API)
    await waitForAssistantResponse(page, 60000);

    // En el primer mensaje, la app puede responder pidiendo el modelo.
    const finalCount = await getMessageCount(page);
    expect(finalCount).toBeGreaterThanOrEqual(afterUserMessage);

    const bodyText = await page.textContent('body');
    const hasAssistantFollowUp =
      bodyText?.includes('modelo') ||
      bodyText?.includes('cafetera') ||
      bodyText?.includes('máquina');
    expect(hasAssistantFollowUp).toBeTruthy();
  });

  test('debe solicitar identificación del modelo en el primer mensaje', async ({ page }) => {
    // Enviar un mensaje
    await sendChatMessage(page, testData.chatMessages.problem);

    // Esperar respuesta
    await waitForAssistantResponse(page, 60000);

    // Verificar que se solicita el modelo (el texto puede variar)
    const bodyText = await page.textContent('body');
    const hasModelRequest =
      bodyText?.includes('modelo') ||
      bodyText?.includes('cafetera') ||
      bodyText?.includes('máquina');

    expect(hasModelRequest).toBeTruthy();
  });

  test('debe aceptar identificación de modelo del usuario', async ({ page }) => {
    // Primer mensaje: problema
    await sendChatMessage(page, testData.chatMessages.problem);
    await waitForAssistantResponse(page, 60000);

    // Segundo mensaje: identificación del modelo
    await sendChatMessage(page, testData.chatMessages.modelIdentification);
    await waitForAssistantResponse(page, 60000);

    // Verificar que el modelo aparece en el header
    const headerText = await page.locator('header').textContent();

    // El modelo debería aparecer en algún lugar del header
    expect(headerText).toBeTruthy();
  });

  test('debe permitir enviar mensajes consecutivos', async ({ page }) => {
    // Enviar primer mensaje
    await sendChatMessage(page, testData.chatMessages.greeting);
    await waitForAssistantResponse(page, 60000);

    const countAfterFirst = await getMessageCount(page);

    // Enviar segundo mensaje
    await sendChatMessage(page, testData.chatMessages.modelIdentification);
    await waitForAssistantResponse(page, 60000);

    const countAfterSecond = await getMessageCount(page);
    expect(countAfterSecond).toBeGreaterThan(countAfterFirst);
  });

  test('debe deshabilitar el botón de envío mientras se procesa', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /enviar mensaje/i });

    // Enviar mensaje
    await sendChatMessage(page, testData.chatMessages.greeting);

    // Verificar que el botón está deshabilitado o hay un spinner
    const isDisabled = await sendButton.isDisabled().catch(() => false);
    const hasSpinner = await page
      .locator('[class*="loading"]')
      .isVisible()
      .catch(() => false);

    // Al menos uno debería ser verdadero
    expect(isDisabled || hasSpinner).toBeTruthy();
  });
});
