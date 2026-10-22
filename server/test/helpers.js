import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { migrate, openDatabase } from '../src/db.js';
import { createPlacesRepository } from '../src/repositories/places.js';

export const ADMIN = { username: 'admin', password: 'correct horse battery staple' };
const passwordHash = bcrypt.hashSync(ADMIN.password, 4);

export const seedPlaces = JSON.parse(
  fs.readFileSync(new URL('../seed/places.json', import.meta.url), 'utf8'),
);

export async function createTestApp({ chat, env = {} } = {}) {
  const config = loadConfig({
    NODE_ENV: 'test',
    ADMIN_USERNAME: ADMIN.username,
    ADMIN_PASSWORD_HASH: passwordHash,
    JWT_SECRET: 'test-secret-test-secret-test-secret-123',
    DATABASE_PATH: ':memory:',
    ...env,
  });
  const db = openDatabase(':memory:');
  migrate(db);
  createPlacesRepository(db).replaceAll(seedPlaces);
  const app = await buildApp({ config, db, chat, logger: false });
  app.addHook('onClose', () => db.close());
  return app;
}

export async function login(app, credentials = ADMIN) {
  const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: credentials });
  const cookie = res.cookies.find((c) => c.name === 'milliy_session');
  return { res, cookie: cookie ? `${cookie.name}=${cookie.value}` : undefined };
}
