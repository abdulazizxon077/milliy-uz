import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, seedPlaces } from './helpers.js';

describe('public places API', () => {
  let app;
  beforeEach(async () => {
    app = await createTestApp();
  });
  afterEach(() => app.close());

  it('reports health', async () => {
    const res = await app.inject('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });

  it('lists all seeded places', async () => {
    const res = await app.inject('/api/places');
    expect(res.statusCode).toBe(200);
    const places = res.json();
    expect(places).toHaveLength(seedPlaces.length);
    expect(places[0]).toMatchObject({ id: expect.any(String), lat: expect.any(Number) });
    expect(places[0]).not.toHaveProperty('reviews');
  });

  it('returns a place with its published reviews', async () => {
    const res = await app.inject('/api/places/auto-pro-chilonzor');
    expect(res.statusCode).toBe(200);
    const place = res.json();
    expect(place.name).toBe('AvtoPro Yunusobod & Chilonzor Servis');
    expect(place.reviews.map((r) => r.author)).toEqual(['Davron Karimov', 'Azizbek Qodirov']);
  });

  it('returns 404 for unknown places', async () => {
    const res = await app.inject('/api/places/does-not-exist');
    expect(res.statusCode).toBe(404);
  });

  it('accepts a valid review and updates the rating', async () => {
    const target = seedPlaces.reduce((a, b) => (a.reviewsCount <= b.reviewsCount ? a : b));
    const before = (await app.inject(`/api/places/${target.id}`)).json();
    const res = await app.inject({
      method: 'POST',
      url: `/api/places/${target.id}/reviews`,
      payload: { author: 'Test User', rating: 1, comment: 'Juda sekin xizmat.' },
    });
    expect(res.statusCode).toBe(201);
    const { place, review } = res.json();
    expect(review.status).toBe('published');
    expect(place.reviewsCount).toBe(before.reviewsCount + 1);
    expect(place.rating).toBeLessThanOrEqual(before.rating);
  });

  it('stores review text verbatim and never as markup', async () => {
    const comment = "<img src=x onerror=alert(1)> zo'r";
    await app.inject({
      method: 'POST',
      url: '/api/places/auto-pro-chilonzor/reviews',
      payload: { author: 'Hacker', rating: 5, comment },
    });
    const place = (await app.inject('/api/places/auto-pro-chilonzor')).json();
    expect(place.reviews[0].comment).toBe(comment);
  });

  it.each([
    [{ author: 'A', rating: 5, comment: 'yaxshi' }],
    [{ author: 'Ali', rating: 6, comment: 'yaxshi' }],
    [{ author: 'Ali', rating: '5', comment: 'yaxshi' }],
    [{ author: 'Ali', rating: 5, comment: 'x'.repeat(1001) }],
    [{ author: 'Ali', rating: 5, comment: 'yaxshi', extra: true }],
  ])('rejects invalid review %j', async (payload) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/places/auto-pro-chilonzor/reviews',
      payload,
    });
    expect(res.statusCode).toBe(400);
  });

  it('rate-limits review submissions', async () => {
    const send = () =>
      app.inject({
        method: 'POST',
        url: '/api/places/auto-pro-chilonzor/reviews',
        payload: { author: 'Ali', rating: 5, comment: 'yaxshi' },
      });
    for (let i = 0; i < 5; i++) expect((await send()).statusCode).toBe(201);
    expect((await send()).statusCode).toBe(429);
  });

  it('sends security headers', async () => {
    const res = await app.inject('/api/health');
    expect(res.headers['content-security-policy']).toContain("script-src 'self'");
    expect(res.headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
