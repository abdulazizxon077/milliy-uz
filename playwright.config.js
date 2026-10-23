import { defineConfig, devices } from '@playwright/test';
import bcrypt from 'bcryptjs';

export const E2E_ADMIN = { username: 'e2e-admin', password: 'e2e-password-123' };
const PORT = 4173;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    serviceWorkers: 'block',
    // Opening hours in the catalog are local to Uzbekistan.
    timezoneId: 'Asia/Tashkent',
    locale: 'uz-UZ',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.PLAYWRIGHT_CHROME_PATH
          ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROME_PATH } }
          : {}),
      },
    },
  ],
  webServer: {
    // Expects `npm run build` to have produced dist/.
    command: 'node server/scripts/seed.js --force && node server/src/index.js',
    url: `http://127.0.0.1:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: String(PORT),
      DATABASE_PATH: 'data/e2e.db',
      JWT_SECRET: 'e2e-secret-e2e-secret-e2e-secret-0000',
      ADMIN_USERNAME: E2E_ADMIN.username,
      ADMIN_PASSWORD_HASH: bcrypt.hashSync(E2E_ADMIN.password, 4),
      COOKIE_SECURE: 'false',
      AI_PROVIDER: 'none',
      LOG_LEVEL: 'warn',
    },
  },
});
