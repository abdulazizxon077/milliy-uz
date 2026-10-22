import { test as base, expect } from '@playwright/test';
import { E2E_ADMIN } from '../playwright.config.js';

/** Fails any test that throws in the page or trips the Content Security Policy. */
export const test = base.extend({
  page: async ({ page }, use) => {
    const problems = [];
    page.on('pageerror', (err) => problems.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && /Content Security Policy|Refused/i.test(msg.text())) {
        problems.push(msg.text());
      }
    });
    await use(page);
    expect(problems, 'page errors / CSP violations').toEqual([]);
  },
});

export { expect };

export async function firstPlace(request) {
  const places = await (await request.get('/api/places')).json();
  return places[0];
}

export async function loginAsAdmin(page) {
  await page.locator('#secret-admin-trigger').click();
  await page.locator('#admin-username').fill(E2E_ADMIN.username);
  await page.locator('#admin-password').fill(E2E_ADMIN.password);
  await page.locator('#admin-login-form button[type=submit]').click();
  await expect(page.locator('#admin-dashboard-modal')).toBeVisible();
}

export const toast = (page) => page.locator('#app-toast');
