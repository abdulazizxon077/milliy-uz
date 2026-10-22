import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, login } from './helpers.js';

const PLACE = 'auto-pro-chilonzor';

describe('information reports', () => {
  let app;
  beforeEach(async () => {
    app = await createTestApp();
  });
  afterEach(() => app.close());

  const report = (payload, id = PLACE) =>
    app.inject({ method: 'POST', url: `/api/places/${id}/reports`, payload });

  it('accepts a report and shows it to the admin', async () => {
    const res = await report({ reason: 'phone', details: '  Raqam ishlamayapti ', contact: '' });
    expect(res.statusCode).toBe(201);
    expect(res.json().status).toBe('open');

    const { cookie } = await login(app);
    const list = await app.inject({
      url: '/api/admin/reports?status=open',
      headers: { cookie },
    });
    expect(list.statusCode).toBe(200);
    const [item] = list.json();
    expect(item).toMatchObject({
      placeId: PLACE,
      reason: 'phone',
      details: 'Raqam ishlamayapti',
      status: 'open',
    });
    expect(item.placeName).toBeTruthy();

    const stats = await app.inject({ url: '/api/admin/stats', headers: { cookie } });
    expect(stats.json().openReports).toBe(1);
  });

  it('lets the admin resolve, dismiss and reopen a report', async () => {
    const { id } = (await report({ reason: 'hours' })).json();
    const { cookie } = await login(app);
    const patch = (status) =>
      app.inject({
        method: 'PATCH',
        url: `/api/admin/reports/${id}`,
        headers: { cookie },
        payload: { status },
      });

    const resolved = (await patch('resolved')).json();
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolvedAt).toBeTruthy();
    expect((await patch('dismissed')).json().status).toBe('dismissed');
    const reopened = (await patch('open')).json();
    expect(reopened.status).toBe('open');
    expect(reopened.resolvedAt).toBeNull();
    expect((await patch('bogus')).statusCode).toBe(400);
  });

  it('validates the reason and requires details for "other"', async () => {
    expect((await report({ reason: 'spam' })).statusCode).toBe(400);
    expect((await report({ reason: 'other', details: 'ok' })).statusCode).toBe(400);
    expect((await report({ reason: 'other', details: 'Narxlar eskirgan' })).statusCode).toBe(201);
    expect((await report({ reason: 'closed', extra: 1 })).statusCode).toBe(400);
  });

  it('returns 404 for an unknown place', async () => {
    expect((await report({ reason: 'closed' }, 'no-such-place')).statusCode).toBe(404);
  });

  it('keeps report moderation behind the admin session', async () => {
    expect((await app.inject('/api/admin/reports')).statusCode).toBe(401);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/reports/x',
      payload: { status: 'resolved' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 404 when patching a missing report', async () => {
    const { cookie } = await login(app);
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/admin/reports/missing',
      headers: { cookie },
      payload: { status: 'resolved' },
    });
    expect(res.statusCode).toBe(404);
  });

  it('rate limits report submissions', async () => {
    const codes = [];
    for (let i = 0; i < 6; i += 1) codes.push((await report({ reason: 'closed' })).statusCode);
    expect(codes.slice(0, 5).every((c) => c === 201)).toBe(true);
    expect(codes[5]).toBe(429);
  });
});
