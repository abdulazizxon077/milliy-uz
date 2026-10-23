import { timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';

export const SESSION_COOKIE = 'milliy_session';

// Compared against when the username is wrong so both paths cost the same.
const DUMMY_HASH = '$2b$12$74bkLQoZW4N55UMD9EhYjubJAtDZQwKp9FQGYhlhAw.fXliPKcWhC';

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

async function authPlugin(app, { auth }) {
  await app.register(cookie);
  await app.register(jwt, {
    secret: auth.jwtSecret,
    cookie: { cookieName: SESSION_COOKIE, signed: false },
    sign: { expiresIn: auth.sessionTtlSeconds },
  });

  app.decorate('verifyAdminCredentials', async (username, password) => {
    if (!auth.username || !auth.passwordHash) return false;
    const userOk = safeEqual(username, auth.username);
    const passOk = await bcrypt.compare(password, userOk ? auth.passwordHash : DUMMY_HASH);
    return userOk && passOk;
  });

  app.decorate('requireAdmin', async (request, reply) => {
    try {
      const payload = await request.jwtVerify();
      if (payload.role !== 'admin') throw new Error('forbidden');
    } catch {
      return reply
        .code(401)
        .send({ error: 'unauthorized', message: 'Avtorizatsiya talab qilinadi' });
    }
  });

  app.decorateReply('setSession', function setSession(token) {
    return this.setCookie(SESSION_COOKIE, token, {
      path: '/api',
      httpOnly: true,
      secure: auth.secureCookie,
      sameSite: 'strict',
      maxAge: auth.sessionTtlSeconds,
    });
  });

  app.decorateReply('clearSession', function clearSession() {
    return this.clearCookie(SESSION_COOKIE, { path: '/api' });
  });
}

export default fp(authPlugin, { name: 'auth' });
