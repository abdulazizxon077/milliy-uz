import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('provides development defaults', () => {
    const config = loadConfig({});
    expect(config.port).toBe(3000);
    expect(config.isProduction).toBe(false);
    expect(config.ai.provider).toBe('none');
  });

  it('requires secrets in production', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/JWT_SECRET/);
  });

  it('rejects a plaintext admin password', () => {
    expect(() => loadConfig({ ADMIN_USERNAME: 'a', ADMIN_PASSWORD_HASH: 'hunter2' })).toThrow(
      /bcrypt/,
    );
  });

  it('rejects unknown AI providers', () => {
    expect(() => loadConfig({ AI_PROVIDER: 'magic' })).toThrow(/AI_PROVIDER/);
  });
});
