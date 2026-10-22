/* global document, window */
import { expect, firstPlace, test, toast } from './fixtures.js';

const detail = (page) => page.locator('#place-detail-modal');

test('opening a place gives it its own address and title', async ({ page, request }) => {
  const place = await firstPlace(request);
  await page.goto('/');
  await page
    .locator(`#places-grid [data-action="open-detail"][data-id="${place.id}"]`)
    .first()
    .click();
  await expect(detail(page)).toBeVisible();
  await expect(page).toHaveURL(`/joy/${place.id}`);
  await expect(page).toHaveTitle(`${place.name} — MILLIY.UZ`);

  await page.goBack();
  await expect(detail(page)).toBeHidden();
  await expect(page).toHaveURL('/');
  await expect(page).toHaveTitle(/O'zbekiston xizmatlar katalogi/);

  await page.goForward();
  await expect(detail(page)).toBeVisible();
  await page.locator('#close-detail-modal').click();
  await expect(detail(page)).toBeHidden();
  await expect(page).toHaveURL('/');
});

test('a shared link opens the place directly', async ({ page, request }) => {
  const place = await firstPlace(request);
  const res = await page.goto(`/joy/${place.id}`);
  expect(res.status()).toBe(200);
  await expect(detail(page)).toBeVisible();
  await expect(page.locator('#detail-title')).toHaveText(place.name);
  const og = await page.locator('meta[property="og:title"]').getAttribute('content');
  expect(og).toBe(place.name);

  // Closing a directly opened place stays on the site.
  await page.keyboard.press('Escape');
  await expect(detail(page)).toBeHidden();
  await expect(page).toHaveURL('/');
});

test('old #id links are upgraded and unknown places are reported', async ({ page, request }) => {
  const place = await firstPlace(request);
  await page.goto(`/#${place.id}`);
  await expect(detail(page)).toBeVisible();
  await expect(page).toHaveURL(`/joy/${place.id}`);

  const res = await page.goto('/joy/mavjud-emas');
  expect(res.status()).toBe(404);
  await expect(toast(page)).toContainText('Joy topilmadi');
  await expect(detail(page)).toBeHidden();
  await expect(page).toHaveURL('/');
});

test('direction and Telegram links point to the place', async ({ page, request }) => {
  const place = await firstPlace(request);
  await page.goto(`/joy/${place.id}`);
  const body = page.locator('#detail-modal-body');
  await expect(body.getByRole('link', { name: 'Google Maps' })).toHaveAttribute(
    'href',
    `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`,
  );
  await expect(body.getByRole('link', { name: 'Yandex Maps' })).toHaveAttribute(
    'href',
    `https://yandex.uz/maps/?rtext=~${place.lat},${place.lng}&rtt=auto`,
  );
  const telegram = await body.getByRole('link', { name: 'Telegram' }).getAttribute('href');
  const shared = new URL(telegram).searchParams.get('url');
  expect(shared).toBe(new URL(`/joy/${place.id}`, page.url()).href);
  await expect(body.locator('a[href^="tel:"]').first()).toBeVisible();
});

test('share copies the place link', async ({ page, context, request }) => {
  const place = await firstPlace(request);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(`/joy/${place.id}`);
  await page.locator('#detail-modal-body [data-action="share-place"]').click();
  await expect(toast(page)).toContainText('Havola nusxalandi');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(new URL(`/joy/${place.id}`, page.url()).href);
});

test('share falls back to a prompt when copying is blocked', async ({ page, request }) => {
  const place = await firstPlace(request);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
    });
    Object.defineProperty(navigator, 'share', { value: undefined });
    document.execCommand = () => false;
    window.prompt = (...args) => {
      window.promptedWith = args;
      return null;
    };
  });
  await page.goto(`/joy/${place.id}`);
  await page.locator('#detail-modal-body [data-action="share-place"]').click();
  await expect
    .poll(() => page.evaluate(() => window.promptedWith))
    .toEqual(['Havolani nusxalang:', new URL(`/joy/${place.id}`, page.url()).href]);
});

test('visitors can report wrong information and admins see it', async ({ page, request }) => {
  const place = await firstPlace(request);
  await page.goto(`/joy/${place.id}`);
  const toggle = page.getByRole('button', { name: 'Xatolik haqida xabar berish' });
  const form = page.locator('#detail-report-form');
  await expect(form).toBeHidden();
  await toggle.click();
  await expect(form).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#report-reason')).toBeFocused();

  // "Boshqa" needs a description.
  await page.locator('#report-reason').selectOption('other');
  await expect(page.locator('#report-details-hint')).toHaveText('(majburiy)');
  await form.getByRole('button', { name: 'Yuborish' }).click();
  await expect(toast(page)).toContainText('qisqacha tasvirlab bering');
  await expect(page.locator('#report-details')).toBeFocused();

  await page.locator('#report-reason').selectOption('phone');
  await page.locator('#report-details').fill("Raqam o'zgargan: +998 90 111 22 33");
  await page.locator('#report-contact').fill('@e2e_user');
  await form.getByRole('button', { name: 'Yuborish' }).click();
  await expect(toast(page)).toContainText('moderatorga yuborildi');
  await expect(form).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('review form keeps typed text while reviews load', async ({ page, request }) => {
  const place = await firstPlace(request);
  await page.route(`**/api/places/${place.id}`, async (route) => {
    await new Promise((r) => setTimeout(r, 500));
    await route.continue();
  });
  await page.goto('/');
  await page
    .locator(`#places-grid [data-action="open-detail"][data-id="${place.id}"]`)
    .first()
    .click();
  await page.locator('#new-rev-author').fill('Yarim yozilgan');
  await expect(page.locator('#detail-reviews')).not.toContainText('Yuklanmoqda');
  await expect(page.locator('#new-rev-author')).toHaveValue('Yarim yozilgan');
  await expect(page.locator('#new-rev-author')).toBeFocused();
});
