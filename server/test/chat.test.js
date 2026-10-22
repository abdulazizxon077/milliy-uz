import { afterEach, describe, expect, it, vi } from 'vitest';
import { createChatService, sanitizeReply } from '../src/services/chat.js';
import { createTestApp } from './helpers.js';

const aiConfig = (provider, keys = {}) => ({
  provider,
  model: '',
  timeoutMs: 1000,
  keys: { gemini: '', openai: '', deepseek: '', ...keys },
});

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('chat service', () => {
  it('is unconfigured without a key', () => {
    expect(createChatService(aiConfig('gemini')).configured).toBe(false);
    expect(createChatService(aiConfig('none')).configured).toBe(false);
  });

  it('sends the Gemini key in a header, never in the URL', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ candidates: [{ content: { parts: [{ text: 'Salom!' }] } }] }),
    );
    const chat = createChatService(aiConfig('gemini', { gemini: 'secret-key' }), { fetchImpl });
    await expect(chat.complete({ system: 's', message: 'm' })).resolves.toBe('Salom!');

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).not.toContain('secret-key');
    expect(init.headers['x-goog-api-key']).toBe('secret-key');
  });

  it('uses bearer auth for OpenAI-compatible providers', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ choices: [{ message: { content: 'ok' } }] }),
    );
    const chat = createChatService(aiConfig('deepseek', { deepseek: 'k' }), { fetchImpl });
    await chat.complete({ system: 's', message: 'm' });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.deepseek.com/v1/chat/completions');
    expect(init.headers.authorization).toBe('Bearer k');
  });

  it('surfaces upstream failures as errors', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, 500));
    const chat = createChatService(aiConfig('openai', { openai: 'k' }), { fetchImpl });
    await expect(chat.complete({ system: 's', message: 'm' })).rejects.toThrow(/500/);
  });

  it('sanitizes model output', () => {
    expect(sanitizeReply('  a\u0000b\r\n\n\n\nc  ')).toBe('ab\n\nc');
    expect(sanitizeReply('x'.repeat(5000))).toHaveLength(2000);
  });
});

describe('POST /api/chat', () => {
  let app;
  afterEach(() => app?.close());

  it('returns 503 when no provider is configured', async () => {
    app = await createTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/chat',
      payload: { message: 'salom' },
    });
    expect(res.statusCode).toBe(503);
  });

  it('proxies to the configured provider with catalog context', async () => {
    const complete = vi.fn(async () => 'Chorsu bozoriga boring.');
    app = await createTestApp({
      chat: { provider: 'gemini', model: 'x', configured: true, complete },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/chat',
      payload: { message: 'usta kerak' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().reply).toContain('Chorsu');
    expect(complete.mock.calls[0][0].system).toContain('Chorsu bozori');
  });

  it('maps provider errors to 502', async () => {
    const complete = vi.fn(async () => {
      throw new Error('boom');
    });
    app = await createTestApp({
      chat: { provider: 'gemini', model: 'x', configured: true, complete },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/chat',
      payload: { message: 'salom' },
    });
    expect(res.statusCode).toBe(502);
  });

  it('validates the message', async () => {
    app = await createTestApp();
    const res = await app.inject({ method: 'POST', url: '/api/chat', payload: { message: '' } });
    expect(res.statusCode).toBe(400);
  });
});
