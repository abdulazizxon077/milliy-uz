/* global document */
import { expect, test, toast } from './fixtures.js';

test('dialogs work from the keyboard and return focus', async ({ page }) => {
  await page.goto('/');
  const title = page.locator('#places-grid article h3 button').first();
  await title.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('#place-detail-modal');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('body')).toHaveClass(/overflow-hidden/);

  // Focus stays inside the dialog while tabbing.
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() =>
      document.getElementById('place-detail-modal').contains(document.activeElement),
    );
    expect(inside).toBe(true);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(title).toBeFocused();
  await expect(page.locator('body')).not.toHaveClass(/overflow-hidden/);
});

test('bookmarks drawer opens a saved place', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('#places-grid article').first();
  const name = await first.locator('h3').innerText();
  await first.locator('[data-action="toggle-bookmark"]').click();
  await page.locator('#open-bookmarks-btn').click();
  await expect(page.locator('#bookmarks-drawer')).toBeVisible();
  await page.locator('#bookmarks-list-container [data-action="open-detail"]').first().click();
  await expect(page.locator('#bookmarks-drawer')).toBeHidden();
  await expect(page.locator('#detail-title')).toHaveText(name);
  await expect(page.locator('#detail-modal-body [data-bookmark-label]')).toHaveText('Saqlangan');
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('bottom navigation scrolls to sections and tracks the active one', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('#mobile-nav');
    await expect(nav).toBeVisible();
    await nav.getByText('Xarita').click();
    await expect(page.locator('#map-section')).toBeInViewport();
    await expect(nav.locator('[aria-current="true"]')).toContainText('Xarita');
    await nav.getByText('Katalog').click();
    await expect(page.locator('#catalog-section')).toBeInViewport();
    await expect(nav.locator('[aria-current="true"]')).toContainText('Katalog');
  });
});

test('the last catalog is shown when the API is unreachable', async ({ page }) => {
  await page.goto('/');
  const count = await page.locator('#places-grid article').count();
  expect(count).toBeGreaterThan(0);

  await page.route('**/api/places', (route) => route.abort('internetdisconnected'));
  await page.reload();
  await expect(toast(page)).toContainText('saqlangan katalog');
  await expect(page.locator('#places-grid article')).toHaveCount(count);
});

test('broken photos fall back to the category placeholder', async ({ page }) => {
  await page.route('https://upload.wikimedia.org/**', (route) => route.abort());
  await page.goto('/');
  const card = page.locator('#places-grid article:has(.place-photo)').first();
  const id = await card.locator('[data-action="open-detail"]').first().getAttribute('data-id');
  const sameCard = page.locator(`#places-grid article:has([data-id="${id}"])`);
  await sameCard.scrollIntoViewIfNeeded();
  await expect(sameCard.locator('.place-photo')).toHaveCount(0);
  await expect(sameCard.locator('.place-placeholder')).toBeVisible();
});

test('missing static files return 404 instead of the app', async ({ request }) => {
  const res = await request.get('/assets/missing-file.js');
  expect(res.status()).toBe(404);
});
