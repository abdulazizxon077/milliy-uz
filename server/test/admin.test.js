import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ADMIN, createTestApp, login, seedPlaces } from './helpers.js';

const newPlace = {
  name: 'Test Ustaxona',
  category: 'auto',
  region: 'tashkent',
  phone: '+998 90 000 00 00',
  lat: 41.3,
  lng: 69.2,
  features: ['Karta orqali to\'lov'],
  pricingDetails: [{ service: 'Diagnostika', price: '50 000 UZS' }],
};

describe('admin auth', () => {
  let app;
  beforeEach(async () => {
    app = await createTestApp();
  });
  afterEach(() => app.close());

  it('rejects wrong credentials', async () => {
    const { res, cookie } = await login(app, { username: ADMIN.username, password: 'nope' });
    expect(res.statusCode).toBe(401);
    expect(cookie).toBeUndefined();
  });

  it('issues an httpOnly, SameSite=strict session cookie', async () => {
    const { res } = await login(app);
    expect(res.statusCode).toBe(200);
    const cookie = res.cookies.find((c) => c.name === 'milliy_session');
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Strict', path: '/api' });
  });

  it('exposes the current admin and logs out', async () => {
    const { cookie } = await login(app);
    const me = await app.inject({ url: '/api/auth/me', headers: { cookie } });
    expect(me.json()).toEqual({ username: ADMIN.username });

    const out = await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { cookie } });
    expect(out.statusCode).toBe(204);
    expect(out.cookies.find((c) => c.name === 'milliy_session').value).toBe('');
  });

  it('rate-limits login attempts', async () => {
    for (let i = 0; i < 5; i++) await login(app, { username: 'x', password: 'y' });
    const { res } = await login(app);
    expect(res.statusCode).toBe(429);
  });

  it('protects admin routes', async () => {
    for (const [method, url] of [
      ['GET', '/api/admin/stats'],
      ['POST', '/api/admin/places'],
      ['DELETE', '/api/admin/places/auto-pro-chilonzor'],
      ['GET', '/api/admin/reviews'],
      ['GET', '/api/admin/places/export'],
    ]) {
      const res = await app.inject({ method, url });
      expect(res.statusCode, `${method} ${url}`).toBe(401);
    }
  });

  it('rejects a forged token', async () => {
    const res = await app.inject({
      url: '/api/admin/stats',
      headers: { cookie: 'milliy_session=eyJhbGciOiJub25lIn0.eyJyb2xlIjoiYWRtaW4ifQ.' },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('admin API', () => {
  let app;
  let cookie;
  const req = (opts) => app.inject({ ...opts, headers: { cookie } });

  beforeEach(async () => {
    app = await createTestApp();
    ({ cookie } = await login(app));
  });
  afterEach(() => app.close());

  it('creates, updates and deletes a place', async () => {
    const created = await req({ method: 'POST', url: '/api/admin/places', payload: newPlace });
    expect(created.statusCode).toBe(201);
    const { id, categoryName } = created.json();
    expect(id).toMatch(/^test-ustaxona-/);
    expect(categoryName).toBe('Avto Ustaxona');

    const updated = await req({ method: 'PUT', url: `/api/admin/places/${id}`, payload: { rating: 4.2 } });
    expect(updated.json().rating).toBe(4.2);

    expect((await req({ method: 'DELETE', url: `/api/admin/places/${id}` })).statusCode).toBe(204);
    expect((await app.inject(`/api/places/${id}`)).statusCode).toBe(404);
  });

  it('validates place payloads', async () => {
    const bad = [
      { ...newPlace, category: 'casino' },
      { ...newPlace, lat: 10 },
      { ...newPlace, image: 'javascript:alert(1)' },
      { ...newPlace, phone: '<script>' },
      { ...newPlace, openTime: '25:00' },
    ];
    for (const payload of bad) {
      const res = await req({ method: 'POST', url: '/api/admin/places', payload });
      expect(res.statusCode, JSON.stringify(payload)).toBe(400);
    }
  });

  it('round-trips export and import', async () => {
    const exported = (await req({ url: '/api/admin/places/export' })).json();
    expect(exported).toHaveLength(seedPlaces.length);

    const res = await req({
      method: 'POST',
      url: '/api/admin/places/import',
      payload: exported.slice(0, 3),
    });
    expect(res.json()).toEqual({ imported: 3 });
    expect((await app.inject('/api/places')).json()).toHaveLength(3);
  });

  it('leaves data untouched when an import is invalid', async () => {
    const res = await req({
      method: 'POST',
      url: '/api/admin/places/import',
      payload: [{ ...newPlace, id: 'ok-one' }, { ...newPlace, id: 'bad', lat: 'x' }],
    });
    expect(res.statusCode).toBe(400);
    expect((await app.inject('/api/places')).json()).toHaveLength(seedPlaces.length);
  });

  it('hides and deletes reviews while keeping ratings consistent', async () => {
    const placeUrl = '/api/places/auto-pro-chilonzor';
    const before = (await app.inject(placeUrl)).json();
    const { review } = (
      await app.inject({
        method: 'POST',
        url: `${placeUrl}/reviews`,
        payload: { author: 'Spammer', rating: 1, comment: 'spam spam' },
      })
    ).json();

    const hidden = await req({
      method: 'PATCH',
      url: `/api/admin/reviews/${review.id}`,
      payload: { status: 'hidden' },
    });
    expect(hidden.json().status).toBe('hidden');

    const after = (await app.inject(placeUrl)).json();
    expect(after.reviews.some((r) => r.id === review.id)).toBe(false);
    expect(after.reviewsCount).toBe(before.reviewsCount);
    expect(after.rating).toBeCloseTo(before.rating, 1);

    const hiddenList = (await req({ url: '/api/admin/reviews?status=hidden' })).json();
    expect(hiddenList.map((r) => r.id)).toContain(review.id);

    expect((await req({ method: 'DELETE', url: `/api/admin/reviews/${review.id}` })).statusCode).toBe(204);
  });

  it('reports stats', async () => {
    const stats = (await req({ url: '/api/admin/stats' })).json();
    expect(stats.places).toBe(seedPlaces.length);
    expect(stats.byCategory.auto).toBeGreaterThan(0);
  });

  it('reads and updates chat settings', async () => {
    const current = (await req({ url: '/api/admin/settings/chat' })).json();
    expect(current).toMatchObject({ provider: 'none', configured: false });

    const res = await req({
      method: 'PUT',
      url: '/api/admin/settings/chat',
      payload: { systemPrompt: 'Faqat qisqa javob bering.' },
    });
    expect(res.json().systemPrompt).toBe('Faqat qisqa javob bering.');
  });
});
