import { expect, test } from './fixtures.js';

const cards = (page) => page.locator('#places-grid article');
const count = (page, category) => page.locator(`[data-category-count="${category}"]`);

test('category cards count places in the selected region', async ({ page }) => {
  await page.goto('/');
  await expect(cards(page).first()).toBeVisible();
  await expect(count(page, 'edu')).toHaveText('21 ta joy');
  await expect(count(page, 'police')).toHaveText('4 ta joy');

  await page.locator('#catalog-region-select').selectOption('bukhara');
  await expect(count(page, 'auto')).toHaveText('1 ta joy');
  await expect(count(page, 'police')).toHaveText('0 ta joy');

  // Picking a category does not change the counts on the other cards.
  await page.locator('#all-categories-grid [data-category="medical"]').click();
  await expect(count(page, 'edu')).toHaveText('2 ta joy');
  await expect(cards(page)).toHaveCount(2);
  await expect(page.locator('#all-categories-grid [data-category="medical"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

const resultCount = async (page) =>
  Number((await page.locator('#places-count-badge').textContent()).match(/\d+/)[0]);

test('search, toggles, sorting and paging work together', async ({ page }) => {
  await page.goto('/');
  await expect(cards(page).first()).toBeVisible();
  const total = await resultCount(page);
  expect(total).toBeGreaterThan(80);
  await expect(cards(page)).toHaveCount(24);

  await page.locator('#places-more-btn').click();
  await expect(cards(page)).toHaveCount(48);

  await page.locator('#filter-with-phone').check();
  await expect.poll(() => resultCount(page)).toBeLessThan(total);
  await expect(cards(page).locator('a[href^="tel:"]')).toHaveCount(24);
  await expect(page.locator('#catalog-reset-btn')).toBeVisible();
  await page.locator('#filter-with-phone').uncheck();
  await expect.poll(() => resultCount(page)).toBe(total);

  await page.locator('#catalog-sort-select').selectOption('rating');
  const ratings = await cards(page)
    .locator('[data-rating]')
    .evaluateAll((els) => els.map((el) => Number(el.dataset.rating)));
  expect(ratings.length).toBe(24);
  expect([...ratings].sort((a, b) => b - a)).toEqual(ratings);

  await page.locator('#catalog-sort-select').selectOption('name');
  await page.locator('#catalog-search-input').fill('chorsu');
  await expect(cards(page).first()).toContainText('Chorsu');
  const found = await cards(page).count();
  expect(found).toBeLessThan(total);
  await expect(page.locator('#places-count-badge')).toHaveText(`${found} ta natija topildi`);

  await page.locator('#catalog-reset-btn').click();
  await expect(page.locator('#catalog-search-input')).toHaveValue('');
  await expect(page.locator('#catalog-sort-select')).toHaveValue('distance');
  await expect.poll(() => resultCount(page)).toBe(total);
});

test('hero search fills the catalog search', async ({ page }) => {
  await page.goto('/');
  await page.locator('#hero-search-input').fill('Chorsu');
  await page.locator('#hero-search-input').press('Enter');
  await expect(page.locator('#catalog-search-input')).toHaveValue('Chorsu');
  await expect(cards(page).first()).toContainText('Chorsu');
  await expect(page.locator('#catalog-section')).toBeInViewport();
});

test('open-now filter uses the clock', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-23T03:30:00+05:00'));
  await page.goto('/');
  await expect(cards(page).first()).toBeVisible();
  const total = await resultCount(page);
  await page.locator('#filter-open-now').check();
  await expect.poll(() => resultCount(page)).toBeLessThan(total);
  const open = await resultCount(page);
  expect(open).toBeGreaterThan(0);
  expect(open).toBeLessThan(total);
  await expect(cards(page).locator('.badge-closed')).toHaveCount(0);
});

test('places closing within the hour are flagged', async ({ page }) => {
  // 17:30 in Tashkent: anything closing at 18:00 is about to close.
  await page.clock.setFixedTime(new Date('2026-10-23T17:30:00+05:00'));
  await page.goto('/');
  await page.locator('#catalog-search-input').fill('politexnika muzeyi');
  await expect(page.locator('#places-grid .badge-closing').first()).toContainText(
    'Tez orada yopiladi',
  );
});

test('empty state appears and clears', async ({ page }) => {
  await page.goto('/');
  await page.locator('#catalog-search-input').fill('mavjud-bolmagan-joy');
  await expect(page.locator('[data-empty-state]')).toContainText('Hech narsa topilmadi');
  await page.locator('[data-empty-state] [data-action="reset-filters"]').click();
  await expect(cards(page).first()).toBeVisible();
  await expect(page.locator('#catalog-search-input')).toHaveValue('');
});
