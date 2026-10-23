import { expect, test } from './fixtures.js';

const cards = (page) => page.locator('#places-grid article');
const count = (page, category) => page.locator(`[data-category-count="${category}"]`);

test('category cards count places in the selected region', async ({ page }) => {
  await page.goto('/');
  await expect(cards(page).first()).toBeVisible();
  await expect(count(page, 'edu')).toHaveText('3 ta joy');
  await expect(count(page, 'sport')).toHaveText('1 ta joy');

  await page.locator('#catalog-region-select').selectOption('bukhara');
  await expect(count(page, 'auto')).toHaveText('1 ta joy');
  await expect(count(page, 'edu')).toHaveText('0 ta joy');

  // Picking a category does not change the counts on the other cards.
  await page.locator('#all-categories-grid [data-category="auto"]').click();
  await expect(count(page, 'medical')).toHaveText('1 ta joy');
  await expect(cards(page)).toHaveCount(1);
});

test('search, toggles and sorting work together', async ({ page }) => {
  await page.goto('/');
  await page.locator('#catalog-region-select').selectOption('all_uz');
  const total = await cards(page).count();
  expect(total).toBeGreaterThan(10);

  await page.locator('#filter-guaranteed').check();
  await expect.poll(() => cards(page).count()).toBeLessThan(total);
  await page.locator('#filter-guaranteed').uncheck();
  await expect(cards(page)).toHaveCount(total);

  await page.locator('#catalog-sort-select').selectOption('rating');
  const ratings = await cards(page)
    .locator('[data-rating]')
    .evaluateAll((els) => els.map((el) => Number(el.dataset.rating)));
  expect(ratings.length).toBe(total);
  expect([...ratings].sort((a, b) => b - a)).toEqual(ratings);

  await page.locator('#catalog-search-input').fill('Registon');
  await expect(cards(page).first()).toContainText('Registon');
  const found = await cards(page).count();
  expect(found).toBeLessThan(total);
  await expect(page.locator('#places-count-badge')).toHaveText(`${found} ta natija topildi`);
});

test('open-now filter uses the clock', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-23T03:30:00+05:00'));
  await page.goto('/');
  await page.locator('#catalog-region-select').selectOption('all_uz');
  const total = await cards(page).count();
  await page.locator('#filter-open-now').check();
  const open = await cards(page).count();
  expect(open).toBeGreaterThan(0);
  expect(open).toBeLessThan(total);
  await expect(cards(page).locator('.badge-closed')).toHaveCount(0);
});

test('places closing within the hour are flagged', async ({ page }) => {
  // 17:30 in Tashkent: anything closing at 18:00 is about to close.
  await page.clock.setFixedTime(new Date('2026-10-23T17:30:00+05:00'));
  await page.goto('/');
  await page.locator('#catalog-region-select').selectOption('all_uz');
  await expect(page.locator('#places-grid .badge-closing').first()).toContainText(
    'Tez orada yopiladi',
  );
});

test('empty state appears and clears', async ({ page }) => {
  await page.goto('/');
  await page.locator('#catalog-search-input').fill('mavjud-bolmagan-joy');
  await expect(page.locator('#places-grid')).toContainText("ma'lumot topilmadi");
  await page.locator('#catalog-search-input').fill('');
  await expect(cards(page).first()).toBeVisible();
});
