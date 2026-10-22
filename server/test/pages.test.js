import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderPlacePage } from '../src/services/page-meta.js';
import { createTestApp } from './helpers.js';

const TEMPLATE = `<!doctype html><html><head>
    <title>MILLIY.UZ</title>
    <meta name="description" content="Generic" />
    <meta property="og:title" content="MILLIY.UZ" />
    <meta property="og:description" content="Generic" />
  </head><body><div id="app"></div></body></html>`;

describe('renderPlacePage', () => {
  it('fills title, description and preview tags', () => {
    const html = renderPlacePage(TEMPLATE, {
      name: 'Shifo "Plus" <clinic>',
      categoryName: 'Tibbiyot',
      address: 'Chilonzor 5',
      phone: '+998 71 000 00 00',
      rating: 4.66,
      reviewsCount: 3,
      image: 'https://example.com/a.jpg',
    });
    expect(html).toContain('<title>Shifo &quot;Plus&quot; &lt;clinic&gt; — MILLIY.UZ</title>');
    expect(html).toContain(
      '<meta name="description" content="Tibbiyot · Chilonzor 5 · +998 71 000 00 00 · ★ 4.7" />',
    );
    expect(html).toContain(
      '<meta property="og:title" content="Shifo &quot;Plus&quot; &lt;clinic&gt;" />',
    );
    expect(html).toContain('<meta property="og:image" content="https://example.com/a.jpg" />');
    expect(html).not.toContain('<clinic>');
  });

  it('skips non-https images', () => {
    const html = renderPlacePage(TEMPLATE, { name: 'X', image: 'javascript:alert(1)' });
    expect(html).not.toContain('og:image');
  });
});

describe('place pages', () => {
  let app;
  let dir;
  beforeAll(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'milliy-static-'));
    fs.writeFileSync(path.join(dir, 'index.html'), TEMPLATE);
    fs.writeFileSync(path.join(dir, 'app.css'), 'body{}');
    app = await createTestApp({ overrides: { staticDir: dir } });
  });
  afterAll(async () => {
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('serves a place page with its own title', async () => {
    const res = await app.inject('/joy/auto-pro-chilonzor');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.body).toContain(
      '<title>AvtoPro Yunusobod &amp; Chilonzor Servis — MILLIY.UZ</title>',
    );
  });

  it('still serves the app for unknown places, with a 404 status', async () => {
    const res = await app.inject('/joy/no-such-place');
    expect(res.statusCode).toBe(404);
    expect(res.body).toContain('<div id="app">');
  });

  it('falls back to the app shell for other page routes', async () => {
    const res = await app.inject('/some/page');
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('<div id="app">');
  });

  it('returns a real 404 for missing files', async () => {
    const res = await app.inject('/assets/missing-abc123.js');
    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toContain('application/json');
  });

  it('does not count static files against the API rate limit', async () => {
    for (let i = 0; i < 320; i += 1) {
      const res = await app.inject('/app.css');
      expect(res.statusCode).toBe(200);
    }
    expect((await app.inject('/api/health')).statusCode).toBe(200);
  });
});
