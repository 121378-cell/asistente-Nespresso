import { test, expect } from '@playwright/test';
import { waitForAppLoad } from './helpers/page-helpers';

interface RepairRecord {
  id: string;
  name: string;
  machineModel: string | null;
  serialNumber: string | null;
  timestamp: number;
  messages: Array<{ role: 'user' | 'model'; text: string }>;
}

const mockRepairsApi = async (page: import('@playwright/test').Page, initialRepairs: RepairRecord[]) => {
  const repairs = [...initialRepairs];

  await page.route('**/api/repairs', async (route, request) => {
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(repairs),
      });
      return;
    }

    if (request.method() === 'POST') {
      const payload = request.postDataJSON() as Omit<RepairRecord, 'id'>;
      const createdRepair: RepairRecord = {
        id: `repair-${repairs.length + 1}`,
        ...payload,
      };
      repairs.unshift(createdRepair);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(createdRepair),
      });
      return;
    }

    await route.continue();
  });

  await page.route('**/api/repairs/*', async (route, request) => {
    if (request.method() === 'DELETE') {
      const id = request.url().split('/').pop() || '';
      const index = repairs.findIndex((repair) => repair.id === id);
      if (index >= 0) {
        repairs.splice(index, 1);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Repair deleted successfully' }),
      });
      return;
    }

    await route.continue();
  });
};

test.describe('Funcionalidad de Reparaciones', () => {
  test.beforeEach(async ({ page }) => {
    await mockRepairsApi(page, []);
    await page.addInitScript(() => {
      window.prompt = () => 'Reparacion E2E';
    });
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('debe abrir el modal de reparaciones guardadas', async ({ page }) => {
    // Abrir modal de reparaciones
    await page.getByRole('button', { name: /reparaciones guardadas/i }).click();

    // Verificar que el modal está visible
    await expect(page.getByRole('heading', { name: /reparaciones guardadas/i })).toBeVisible();
  });

  test('debe mostrar la lista de reparaciones (si existen)', async ({ page }) => {
    // Abrir modal de reparaciones
    await page.getByRole('button', { name: /reparaciones guardadas/i }).click();

    // Verificar que hay contenido en el modal
    const modal = page
      .locator('div[role="dialog"], div.fixed.inset-0')
      .filter({ hasText: /reparaciones guardadas/i })
      .first();
    const modalText = await modal.textContent();

    // Debería tener algún texto (lista vacía o con reparaciones)
    expect(modalText).toBeTruthy();
    expect(modalText!.length).toBeGreaterThan(0);
  });

  test('debe tener un botón para guardar nueva reparación', async ({ page }) => {
    // Abrir modal de reparaciones
    await page.getByRole('button', { name: /reparaciones guardadas/i }).click();
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
    await page.getByRole('button', { name: /reparaciones guardadas/i }).click();

    // Cerrar modal haciendo clic fuera del contenedor
    await page.locator('div.fixed.inset-0').first().click({ position: { x: 8, y: 8 } });

    // Verificar que el modal cerró
    await expect(page.getByRole('heading', { name: /reparaciones guardadas/i })).toHaveCount(0);
  });

  test('debe guardar una reparación con datos válidos', async ({ page }) => {
    const createRepairRequest = page.waitForRequest(
      (request) => request.url().includes('/api/repairs') && request.method() === 'POST'
    );

    await page
      .getByRole('textbox', { name: /escribe tu mensaje sobre reparación de cafeteras/i })
      .fill('Necesito ayuda con la maquina');
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    await page.getByRole('button', { name: /reparaciones guardadas/i }).click();
    const saveButton = page.getByRole('button', { name: /guardar conversación actual/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    const request = await createRepairRequest;
    const payload = request.postDataJSON() as { name: string };
    expect(payload.name).toBe('Reparacion E2E');
  });

  test('debe cargar una reparación existente', async ({ page }) => {
    await mockRepairsApi(page, [
      {
        id: 'repair-loaded',
        name: 'Carga E2E',
        machineModel: 'Zenius',
        serialNumber: 'ZE123456',
        timestamp: Date.now(),
        messages: [
          { role: 'model', text: 'Hola, preséntate.' },
          { role: 'user', text: 'Mensaje de reparación cargada' },
        ],
      },
    ]);

    await page.reload();
    await waitForAppLoad(page);
    await page.getByRole('button', { name: /reparaciones guardadas/i }).click();
    await page.getByRole('button', { name: /^cargar$/i }).click();

    await expect(page.getByText(/modelo: zenius/i)).toBeVisible();
    await expect(page.getByText('Mensaje de reparación cargada')).toBeVisible();
  });

  test('debe eliminar una reparación', async ({ page }) => {
    await mockRepairsApi(page, [
      {
        id: 'repair-delete',
        name: 'Eliminar E2E',
        machineModel: 'Gemini CS2',
        serialNumber: 'GM999999',
        timestamp: Date.now(),
        messages: [{ role: 'user', text: 'Eliminar este registro' }],
      },
    ]);

    await page.addInitScript(() => {
      window.confirm = () => true;
    });
    await page.reload();
    await waitForAppLoad(page);

    await page.getByRole('button', { name: /reparaciones guardadas/i }).click();
    await expect(page.getByText('Eliminar E2E')).toBeVisible();
    await page.getByRole('button', { name: /eliminar reparación/i }).click();
    await expect(page.getByText('Eliminar E2E')).toHaveCount(0);
  });
});
