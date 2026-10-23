import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { migrate, openDatabase } from './db.js';

const config = loadConfig();
const db = openDatabase(config.databasePath);
migrate(db);

const logger = {
  level: config.logLevel,
  redact: ['req.headers.cookie', 'req.headers.authorization'],
  ...(config.isProduction ? {} : { transport: { target: 'pino-pretty' } }),
};

const app = await buildApp({ config, db, logger });

if (!app.hasPlugin('@fastify/static') && config.staticDir) {
  app.log.warn('SERVE_STATIC is enabled but dist/ was not found; run `npm run build` first');
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    app.log.info({ signal }, 'shutting down');
    await app.close();
    db.close();
    process.exit(0);
  });
}

await app.listen({ host: config.host, port: config.port });
