import { idParams, reviewCreateSchema } from '../schemas.js';
import { buildCatalogContext, DEFAULT_SYSTEM_PROMPT } from '../services/chat.js';

export default async function publicRoutes(app, { repos, chat, db }) {
  app.get('/health', async () => {
    db.prepare('SELECT 1').get();
    return { status: 'ok' };
  });

  app.get('/places', async (_request, reply) => {
    reply.header('cache-control', 'public, max-age=60');
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
      return reply.code(201).send({ review, place: repos.places.get(request.params.id) });
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
