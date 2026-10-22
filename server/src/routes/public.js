import { idParams, reportCreateSchema, reviewCreateSchema } from '../schemas.js';
import { buildCatalogContext, DEFAULT_SYSTEM_PROMPT } from '../services/chat.js';

export default async function publicRoutes(app, { repos, chat, db }) {
  app.get('/health', async () => {
    db.prepare('SELECT 1').get();
    return { status: 'ok' };
  });

  app.get('/places', async (_request, reply) => {
    // Admins edit this list live, so clients must revalidate every time.
    reply.header('cache-control', 'no-cache');
    return repos.places.list();
  });

  app.get('/places/:id', { schema: { params: idParams } }, async (request, reply) => {
    const place = repos.places.getWithReviews(request.params.id);
    if (!place) return reply.code(404).send({ error: 'not_found', message: 'Joy topilmadi' });
    return place;
  });

  app.post(
    '/places/:id/reviews',
    {
      schema: { params: idParams, body: reviewCreateSchema },
      config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
    },
    async (request, reply) => {
      const body = {
        author: request.body.author.trim(),
        rating: request.body.rating,
        comment: request.body.comment.trim(),
      };
      const review = repos.reviews.create(request.params.id, body);
      if (!review) return reply.code(404).send({ error: 'not_found', message: 'Joy topilmadi' });
      return reply
        .code(201)
        .send({ review, place: repos.places.getWithReviews(request.params.id) });
    },
  );

  app.post(
    '/places/:id/reports',
    {
      schema: { params: idParams, body: reportCreateSchema },
      config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
    },
    async (request, reply) => {
      const details = (request.body.details ?? '').trim();
      const contact = (request.body.contact ?? '').trim();
      if (request.body.reason === 'other' && details.length < 5) {
        return reply
          .code(400)
          .send({ error: 'bad_request', message: 'Muammoni qisqacha tasvirlab bering' });
      }
      const report = repos.reports.create(request.params.id, {
        reason: request.body.reason,
        details,
        contact,
      });
      if (!report) return reply.code(404).send({ error: 'not_found', message: 'Joy topilmadi' });
      return reply.code(201).send({ id: report.id, status: report.status });
    },
  );

  app.post(
    '/chat',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['message'],
          properties: { message: { type: 'string', minLength: 1, maxLength: 500 } },
        },
      },
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      if (!chat.configured) {
        return reply
          .code(503)
          .send({ error: 'chat_unavailable', message: 'AI xizmati sozlanmagan' });
      }
      const prompt = repos.settings.get('chat.systemPrompt', DEFAULT_SYSTEM_PROMPT);
      const system = `${prompt}\n\nKatalog:\n${buildCatalogContext(repos.places.list())}`;
      try {
        const answer = await chat.complete({ system, message: request.body.message.trim() });
        return { reply: answer };
      } catch (err) {
        request.log.warn({ err }, 'chat provider request failed');
        return reply.code(502).send({ error: 'chat_failed', message: 'AI xizmati javob bermadi' });
      }
    },
  );
}
