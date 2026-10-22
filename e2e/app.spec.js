import { E2E_ADMIN } from '../playwright.config.js';
import { expect, test } from './fixtures.js';

test('API health and security headers', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBe(true);
  const page = await request.get('/');
  expect(page.headers()['content-security-policy']).toContain("script-src 'self'");
  expect(page.headers()['x-content-type-options']).toBe('nosniff');
});

test('catalog loads, filters and opens a place', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#places-grid article');
  await expect(cards.first()).toBeVisible();
  await expect(page.locator('#places-count-badge')).toContainText('ta natija topildi');

  await page.locator('#catalog-region-select').selectOption('all_uz');
  const total = await cards.count();
  await page.locator('#all-categories-grid [data-category="medical"]').click();
  await expect.poll(() => cards.count()).toBeLessThan(total);

  await page.locator('#catalog-search-input').fill('zzzz-yoq');
  await expect(page.locator('#places-grid')).toContainText('Hech narsa topilmadi');
  await page.locator('#catalog-search-input').fill('');

  await cards.first().locator('h3 button').click();
  await expect(page.locator('#place-detail-modal')).toBeVisible();
  await expect(page.locator('#detail-reviews')).not.toContainText('Yuklanmoqda');
  await page.keyboard.press('Escape');
  await expect(page.locator('#place-detail-modal')).toBeHidden();
});

test('visitor can post a review that is escaped', async ({ page }) => {
  await page.goto('/');
  await page.locator('#places-grid article h3 button').first().click();
  await page.locator('#new-rev-author').fill('Test <b>Mijoz</b>');
  await page.locator('#new-rev-comment').fill("<img src=x onerror=alert(1)> Zo'r xizmat");
  await page.locator('#detail-review-form button[type=submit]').click();
  await expect(page.locator('#app-toast')).toContainText('qabul qilindi');
  await expect(page.locator('#detail-reviews')).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('#detail-reviews img')).toHaveCount(0);
});

test('bookmarks persist across reloads', async ({ page }) => {
  await page.goto('/');
  await page.locator('#places-grid [data-action="toggle-bookmark"]').first().click();
  await expect(page.locator('#bookmarks-count-pill')).toHaveText('1');
  await page.reload();
  await expect(page.locator('#bookmarks-count-pill')).toHaveText('1');
  await page.locator('#open-bookmarks-btn').click();
  await expect(page.locator('#bookmarks-list-container [data-action="open-detail"]')).toHaveCount(
    1,
  );
});

test('chat falls back to the offline matcher', async ({ page }) => {
  await page.goto('/');
  await page.locator('#ai-user-input').fill('metan zapravka');
  await page.locator('#ai-send-btn').click();
  await expect(page.locator('#ai-chat-messages')).toContainText(
    'Zapravka va quvvatlash shoxobchalari',
  );
});

test('admin login, CRUD and logout', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href="/admin"], #secret-admin-trigger')).toHaveCount(0);
  await expect(page.locator('#admin-password')).toHaveCount(0);
  await page.goto('/admin');
  await page.locator('#admin-username').fill(E2E_ADMIN.username);
  await page.locator('#admin-password').fill('wrong-password');
  await page.locator('#admin-login-form button[type=submit]').click();
  await expect(page.locator('#admin-login-error')).toBeVisible();

  await page.locator('#admin-password').fill(E2E_ADMIN.password);
  await page.locator('#admin-login-form button[type=submit]').click();
  await expect(page.locator('#admin-dashboard-modal')).toBeVisible();
  await expect(page.locator('#admin-kpi-total-places')).not.toHaveText('—');

  await page.locator('.admin-nav-item[data-admin-tab="places"]').click();
  await page.locator('[data-action="admin-add-place"]').first().click();
  await page.locator('#edit-p-name').fill('E2E Test Ustaxona');
  await page.locator('#edit-p-phone').fill('+998 90 000 00 00');
  await page.locator('#admin-edit-place-form button[type=submit]').click();
  await expect(page.locator('#app-toast')).toContainText('Obyekt saqlandi');
  await page.locator('#admin-search-input').fill('E2E Test');
  await expect(page.locator('#admin-places-table-body tr')).toHaveCount(1);

  page.once('dialog', (d) => d.accept());
  await page.locator('[data-action="admin-delete-place"]').click();
  await expect(page.locator('#app-toast')).toContainText("Obyekt o'chirildi");

  await page.locator('.admin-nav-item[data-admin-tab="reviews"]').click();
  await expect(page.locator('#admin-reviews-list-container')).not.toBeEmpty();

  await page.locator('#admin-logout-btn').click();
  await expect(page.locator('#admin-dashboard-modal')).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
  const me = await page.request.get('/api/auth/me');
  expect(me.status()).toBe(401);
});
