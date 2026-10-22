import { expect, test } from './fixtures.js';

test('footer links open the standalone pages', async ({ page }) => {
  await page.goto('/');
  for (const [href, title] of [
    ['/haqida', 'Loyiha haqida'],
    ['/aloqa', 'Aloqa'],
    ['/maxfiylik', 'Maxfiylik siyosati'],
  ]) {
    await page.locator(`footer a[href="${href}"]`).click();
    await expect(page).toHaveURL(href);
    await expect(page.locator('#page-view h1')).toHaveText(title);
    await expect(page.locator('#home-view')).toBeHidden();
    await expect(page).toHaveTitle(new RegExp(title));
    await page.goBack();
    await expect(page.locator('#home-view')).toBeVisible();
  }
});

test('pages load directly and the footer has no admin link', async ({ page, request }) => {
  const res = await request.get('/haqida');
  expect(res.status()).toBe(200);
  await page.goto('/haqida');
  await expect(page.locator('#page-view')).toContainText('OpenStreetMap');
  await expect(page.locator('#page-view')).toContainText('1050');
  await expect(page.locator('footer')).not.toContainText('Admin');
  await expect(page.locator('a[href="/admin"]')).toHaveCount(0);

  await page.locator('#page-view [data-nav-home]').first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#places-grid article').first()).toBeVisible();
});

test('unknown addresses show the 404 page', async ({ page, request }) => {
  const res = await request.get('/bu-sahifa-yoq');
  expect(res.status()).toBe(404);
  await page.goto('/bu-sahifa-yoq');
  await expect(page.locator('#page-view')).toHaveAttribute('data-page', 'not-found');
  await expect(page.locator('.page-404-code')).toHaveText('404');
  await page.getByRole('link', { name: 'Katalogda qidirish' }).click();
  await expect(page.locator('#catalog-section')).toBeInViewport();
});

test('leaving the admin sign-in returns to the site', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.locator('#admin-login-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#admin-login-modal')).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
});

test('chat input does not offer saved credentials', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#ai-user-input');
  await expect(input).toHaveAttribute('autocomplete', 'off');
  await expect(input).toHaveAttribute('name', 'chat-message');
  await expect(page.locator('input[type=password]')).toHaveCount(0);
  const unnamed = await page
    .locator('input:not([type=checkbox]):not([type=file]), select, textarea')
    .evaluateAll((els) => els.filter((el) => !el.name).map((el) => el.id));
  expect(unnamed).toEqual([]);
});

test('chat answers once per message', async ({ page }) => {
  await page.goto('/');
  await page.locator('#ai-user-input').fill('Samarqanddagi muzeylar');
  await page.locator('#ai-user-input').press('Enter');
  await expect(page.locator('#ai-chat-messages')).toContainText('Samarqanddagi muzeylar');
  const mine = page.locator('#ai-chat-messages .justify-end');
  await expect(mine).toHaveCount(1);
  await expect(mine).toContainText('Samarqanddagi muzeylar');
});

test('map shows tiles with attribution and fits the shown places', async ({ page }) => {
  await page.goto('/');
  const map = page.locator('#leaflet-map-container');
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap');
  await expect(map.locator('img.leaflet-tile').first()).toHaveAttribute(
    'src',
    /tile\.openstreetmap\.org/,
  );
  await expect(page.locator('#map-count')).toContainText('ta joy');

  await expect(map).toHaveClass(/map-dark/);
  await page.locator('#btn-map-style').click();
  await expect(map).not.toHaveClass(/map-dark/);
  await expect(page.locator('#btn-map-style')).toHaveAttribute('aria-pressed', 'false');

  await page.locator('#catalog-region-select').selectOption('xorazm');
  await page.locator('#btn-map-fit').click();
  await expect(page.locator('#map-count')).toContainText('9 ta joy');
});
