import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './e2e',

    /* Ejecutar tests en paralelo */
    fullyParallel: true,

    /* Fallar el build en CI si dejaste test.only */
    forbidOnly: !!process.env.CI,

    /* Reintentar en CI */
    retries: process.env.CI ? 2 : 0,

    /* Limitar workers en CI */
    workers: process.env.CI ? 1 : undefined,

    /* Reporter */
    reporter: [
        ['html'],
        ['list']
    ],

    /* Configuración compartida para todos los proyectos */
    use: {
        /* URL base para usar en acciones como `await page.goto('/')` */
        baseURL: 'http://localhost:3000',

        /* Capturar screenshot solo en fallos */
        screenshot: 'only-on-failure',

        /* Capturar video solo en fallos */
        video: 'retain-on-failure',

        /* Capturar trace en fallos */
        trace: 'on-first-retry',
    },

    /* Configurar proyectos para diferentes navegadores */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // Descomentar para testear en más navegadores
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },

        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

        /* Tests en móviles */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },
    ],

    /* Servidor de desarrollo */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
