import fs from 'node:fs';
import path from 'node:path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import authPlugin from './plugins/auth.js';
import { createPlacesRepository } from './repositories/places.js';
import { createReviewsRepository } from './repositories/reviews.js';
import { createSettingsRepository } from './repositories/settings.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import { createChatService } from './services/chat.js';

const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  // Leaflet positions tiles and markers through inline style attributes.
  styleSrc: ["'self'", "'unsafe-inline'"],
  // Place photos are admin-provided https URLs, so any https image host is allowed.
  imgSrc: ["'self'", 'data:', 'https:'],
  fontSrc: ["'self'"],
  connectSrc: ["'self'"],
  manifestSrc: ["'self'"],
  workerSrc: ["'self'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: null,
};

export async function buildApp({ config, db, chat, logger = true }) {
  const app = Fastify({
    logger,
    trustProxy: config.trustProxy,
    bodyLimit: 256 * 1024,
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false, allErrors: false } },
  });

  const repos = {
    places: createPlacesRepository(db),
    reviews: createReviewsRepository(db),
    settings: createSettingsRepository(db),
  };
  chat ??= createChatService(config.ai);

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        ...CSP_DIRECTIVES,
        upgradeInsecureRequests: config.isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: config.isProduction,
  });

  await app.register(cors, {
    origin: config.corsOrigins.length ? config.corsOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  await app.register(rateLimit, { global: true, max: 300, timeWindow: '1 minute' });
  await app.register(authPlugin, { auth: config.auth });

  app.setErrorHandler((err, request, reply) => {
    if (err.validation) {
      return reply.code(400).send({ error: 'validation_error', message: err.message });
    }
    const status = err.statusCode ?? 500;
    if (status >= 500) {
      request.log.error({ err }, 'unhandled error');
      return reply.code(500).send({ error: 'internal_error', message: 'Server xatosi' });
    }
    return reply.code(status).send({ error: err.code ?? 'request_error', message: err.message });
  });

  await app.register(
    async (api) => {
      await api.register(publicRoutes, { repos, chat, db });
      await api.register(authRoutes, { prefix: '/auth' });
      await api.register(adminRoutes, { prefix: '/admin', repos, chat });
    },
    { prefix: '/api' },
  );

  if (config.staticDir && fs.existsSync(path.join(config.staticDir, 'index.html'))) {
    await app.register(fastifyStatic, {
      root: config.staticDir,
      wildcard: false,
      setHeaders(res, filePath) {
        const name = path.basename(filePath);
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('cache-control', 'public, max-age=31536000, immutable');
        } else if (name === 'index.html' || name === 'sw.js') {
          res.setHeader('cache-control', 'no-cache');
        }
      },
    });
  }

  app.setNotFoundHandler((request, reply) => {
    const wantsPage = request.method === 'GET' && !request.url.startsWith('/api/');
    if (wantsPage && config.staticDir && reply.sendFile) {
      return reply.header('cache-control', 'no-cache').sendFile('index.html');
    }
    return reply.code(404).send({ error: 'not_found', message: 'Topilmadi' });
  });

  return app;
}
