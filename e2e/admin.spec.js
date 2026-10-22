import fs from 'node:fs';
import { expect, firstPlace, loginAsAdmin, test, toast } from './fixtures.js';

const tab = (page, name) => page.locator(`.admin-nav-item[data-admin-tab="${name}"]`);

test('admin works through reported information', async ({ page, request }) => {
  const place = await firstPlace(request);
  const created = await request.post(`/api/places/${place.id}/reports`, {
    data: { reason: 'hours', details: 'Yakshanba kuni ham ishlaydi', contact: '+998 90 000 11 22' },
  });
  expect(created.status()).toBe(201);

  await loginAsAdmin(page);
  await expect(page.locator('#admin-reports-badge')).toBeVisible();
  await tab(page, 'reports').click();
  await expect(page.locator('#admin-breadcrumb-title')).toHaveText("Ma'lumot xatolari");

  const row = page
    .locator('#admin-reports-list-container [data-report-id]')
    .filter({ hasText: 'Yakshanba kuni ham ishlaydi' });
  await expect(row).toContainText("Ish vaqti noto'g'ri");
  await expect(row).toContainText(place.name);

  // Jump to the editor, fix the hours and save.
  await row.getByRole('button', { name: /tahrirlash/ }).click();
  await expect(page.locator('#admin-edit-modal')).toBeVisible();
  await expect(page.locator('#edit-p-name')).toHaveValue(place.name);
  await page.locator('#edit-p-hours').fill('bugun ochiq');
  await page.locator('#admin-edit-place-form button[type=submit]').click();
  expect(await page.locator('#edit-p-hours').evaluate((el) => el.validity.valid)).toBe(false);
  await page.locator('#edit-p-hours').fill('24/7');
  await page.locator('#admin-edit-place-form button[type=submit]').click();
  await expect(toast(page)).toContainText('Obyekt saqlandi');
  const updated = await (await request.get(`/api/places/${place.id}`)).json();
  expect(updated).toMatchObject({ openingHours: '24/7', phone: place.phone });
  expect(updated.experienceText).toBe(place.experienceText);

  await row.getByRole('button', { name: 'Hal qilindi' }).click();
  await expect(toast(page)).toContainText('hal qilingan');
  await expect(row).toHaveCount(0);

  await page.locator('#admin-reports-filter').selectOption('resolved');
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Qayta ochish' }).click();
  await expect(toast(page)).toContainText('qayta ochildi');
  await page.locator('#admin-reports-filter').selectOption('open');
  await row.getByRole('button', { name: 'Rad etish' }).click();
  await expect(toast(page)).toContainText('rad etildi');
});

test('admin can hide and republish a review', async ({ page, request }) => {
  const place = await firstPlace(request);
  const post = await request.post(`/api/places/${place.id}/reviews`, {
    data: { author: 'Moderatsiya Test', rating: 2, comment: 'Yashiriladigan sharh' },
  });
  expect(post.status()).toBe(201);

  await loginAsAdmin(page);
  await tab(page, 'reviews').click();
  const row = page
    .locator('#admin-reviews-list-container > div')
    .filter({ hasText: 'Yashiriladigan sharh' });
  await row.getByRole('button', { name: 'Yashirish' }).click();
  await expect(toast(page)).toContainText('yashirildi');
  let full = await (await request.get(`/api/places/${place.id}`)).json();
  expect(full.reviews.map((r) => r.comment)).not.toContain('Yashiriladigan sharh');

  await row.getByRole('button', { name: 'Chop etish' }).click();
  await expect(toast(page)).toContainText('chop etildi');
  full = await (await request.get(`/api/places/${place.id}`)).json();
  expect(full.reviews.map((r) => r.comment)).toContain('Yashiriladigan sharh');

  page.once('dialog', (d) => d.accept());
  await row.getByRole('button', { name: "O'chirish" }).click();
  await expect(toast(page)).toContainText("o'chirildi");
});

test('catalog export and import round-trip', async ({ page }, testInfo) => {
  await loginAsAdmin(page);
  await tab(page, 'places').click();

  const download = page.waitForEvent('download');
  await page.locator('[data-action="admin-export"]').first().click();
  const file = testInfo.outputPath('catalog.json');
  await (await download).saveAs(file);
  const exported = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(exported.length).toBeGreaterThan(10);

  const bad = testInfo.outputPath('bad.json');
  fs.writeFileSync(bad, '{"not": "a list"}');
  await page.locator('#admin-import-json-file').setInputFiles(bad);
  await expect(toast(page)).toContainText("Noto'g'ri fayl");

  page.once('dialog', (d) => d.accept());
  await page.locator('#admin-import-json-file').setInputFiles(file);
  await expect(toast(page)).toContainText(String(exported.length));
});
