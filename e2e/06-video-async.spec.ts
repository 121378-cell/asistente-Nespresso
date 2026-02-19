import { test, expect } from '@playwright/test';
import { waitForAppLoad } from './helpers/page-helpers';

const IMAGE_FIXTURE = {
  name: 'frame.jpg',
  mimeType: 'image/jpeg',
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
};

test.describe('Video Async Flow', () => {
  test('happy path: enqueue + polling + completed', async ({ page }) => {
    let statusCallCount = 0;

    await page.route('**/api/video/generate', async (route) => {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          jobId: '11111111-1111-1111-1111-111111111111',
          status: 'queued',
          requestId: 'req-e2e-1',
        }),
      });
    });

    await page.route('**/api/video/status', async (route) => {
      statusCallCount += 1;

      if (statusCallCount < 2) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jobId: '11111111-1111-1111-1111-111111111111',
            status: 'running',
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jobId: '11111111-1111-1111-1111-111111111111',
          status: 'completed',
          result: {
            response: {
              generatedVideos: [{ video: { uri: 'https://cdn.example.com/video-happy.mp4' } }],
            },
          },
        }),
      });
    });

    await page.route('https://cdn.example.com/video-happy.mp4', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'video/mp4',
        body: Buffer.from([0x00, 0x00, 0x00, 0x20]),
      });
    });

    await page.goto('/');
    await waitForAppLoad(page);

    await page.getByRole('button', { name: /crear video/i }).click();
    await page.locator('#file-upload-veo').setInputFiles(IMAGE_FIXTURE);
    await page.locator('#prompt').fill('Genera un video técnico de reparación');
    await page.getByRole('button', { name: /generar vídeo/i }).click();

    await expect(page.getByText('¡Tu vídeo está listo!')).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('link', { name: /descargar vídeo/i })).toBeVisible();
  });

  test('retry path: transient status error recovers and completes', async ({ page }) => {
    let statusCallCount = 0;

    await page.route('**/api/video/generate', async (route) => {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          jobId: '22222222-2222-2222-2222-222222222222',
          status: 'queued',
          requestId: 'req-e2e-2',
        }),
      });
    });

    await page.route('**/api/video/status', async (route) => {
      statusCallCount += 1;

      if (statusCallCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Temporary provider outage' }),
        });
        return;
      }

      if (statusCallCount === 2) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jobId: '22222222-2222-2222-2222-222222222222',
            status: 'running',
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jobId: '22222222-2222-2222-2222-222222222222',
          status: 'completed',
          result: {
            response: {
              generatedVideos: [{ video: { uri: 'https://cdn.example.com/video-retry.mp4' } }],
            },
          },
        }),
      });
    });

    await page.route('https://cdn.example.com/video-retry.mp4', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'video/mp4',
        body: Buffer.from([0x00, 0x00, 0x00, 0x20]),
      });
    });

    await page.goto('/');
    await waitForAppLoad(page);

    await page.getByRole('button', { name: /crear video/i }).click();
    await page.locator('#file-upload-veo').setInputFiles(IMAGE_FIXTURE);
    await page.locator('#prompt').fill('Genera un video con reintento');
    await page.getByRole('button', { name: /generar vídeo/i }).click();

    await expect(page.getByText('¡Tu vídeo está listo!')).toBeVisible({ timeout: 25000 });
  });
});
