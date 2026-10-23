import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const AI_PROVIDERS = ['none', 'gemini', 'openai', 'deepseek'];

function toInt(value, fallback) {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes'].includes(String(value).toLowerCase());
}

function list(value) {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';
  const errors = [];

  let jwtSecret = env.JWT_SECRET ?? '';
  if (jwtSecret.length < 32) {
    if (isProduction) errors.push('JWT_SECRET must be set to at least 32 characters');
    else jwtSecret = 'development-only-secret-change-me-0000000000';
  }

  let adminUsername = env.ADMIN_USERNAME ?? '';
  let adminPasswordHash = env.ADMIN_PASSWORD_HASH ?? '';
  if (!isProduction) {
    if (!adminUsername) adminUsername = 'admin';
    if (!adminPasswordHash) adminPasswordHash = '$2b$10$FhPuKRYDkgaZxFMpNSK0xuNWgDrqwUCMExW2WlOyhdlPu6NGnid/6';
  }
  if (isProduction && (!adminUsername || !adminPasswordHash)) {
    errors.push('ADMIN_USERNAME and ADMIN_PASSWORD_HASH must be set');
  }
  if (adminPasswordHash && !/^\$2[aby]\$\d{2}\$/.test(adminPasswordHash)) {
    errors.push('ADMIN_PASSWORD_HASH must be a bcrypt hash (see `npm run hash-password`)');
  }

  const aiProvider = (env.AI_PROVIDER ?? 'none').toLowerCase();
  if (!AI_PROVIDERS.includes(aiProvider)) {
    errors.push(`AI_PROVIDER must be one of: ${AI_PROVIDERS.join(', ')}`);
  }

  if (errors.length) {
    throw new Error(`Invalid configuration:\n  - ${errors.join('\n  - ')}`);
  }

  return Object.freeze({
    nodeEnv,
    isProduction,
    host: env.HOST ?? '0.0.0.0',
    port: toInt(env.PORT, 3000),
    logLevel: env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
    trustProxy: toBool(env.TRUST_PROXY, false),
    databasePath: path.resolve(ROOT_DIR, env.DATABASE_PATH ?? 'data/milliy.db'),
    corsOrigins: list(env.CORS_ORIGIN),
    staticDir: toBool(env.SERVE_STATIC, isProduction) ? path.join(ROOT_DIR, 'dist') : null,
    auth: Object.freeze({
      username: adminUsername,
      passwordHash: adminPasswordHash,
      jwtSecret,
      sessionTtlSeconds: toInt(env.SESSION_TTL_SECONDS, 8 * 60 * 60),
      secureCookie: toBool(env.COOKIE_SECURE, isProduction),
    }),
    ai: Object.freeze({
      provider: aiProvider,
      model: env.AI_MODEL ?? '',
      timeoutMs: toInt(env.AI_TIMEOUT_MS, 15_000),
      keys: Object.freeze({
        gemini: env.GEMINI_API_KEY ?? '',
        openai: env.OPENAI_API_KEY ?? '',
        deepseek: env.DEEPSEEK_API_KEY ?? '',
      }),
    }),
  });
}

export { ROOT_DIR };
