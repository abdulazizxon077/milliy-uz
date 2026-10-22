import { describe, expect, it } from 'vitest';
import { createTestApp } from './helpers.js';

async function headersFor(env) {
  const app = await createTestApp({ env });
  try {
    const res = await app.inject('/api/health');
    return res.headers;
  } finally {
    await app.close();
  }
}

describe('security headers', () => {
  it('forces HTTPS when secure cookies are enabled', async () => {
    const headers = await headersFor({ COOKIE_SECURE: 'true' });
    expect(headers['content-security-policy']).toContain('upgrade-insecure-requests');
    expect(headers['strict-transport-security']).toBeDefined();
  });

  it('leaves plain HTTP deployments usable', async () => {
    const headers = await headersFor({ NODE_ENV: 'production', COOKIE_SECURE: 'false' });
    expect(headers['content-security-policy']).not.toContain('upgrade-insecure-requests');
    expect(headers['strict-transport-security']).toBeUndefined();
  });
});
