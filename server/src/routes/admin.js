import {
  idParams,
  placeCreateSchema,
  placesImportSchema,
  placeUpdateSchema,
  REPORT_STATUSES,
} from '../schemas.js';
import { parseOpeningHours } from '../../../shared/opening-hours.js';
import { DEFAULT_SYSTEM_PROMPT } from '../services/chat.js';

function badHours(places) {
  return places.find((p) => p.openingHours && !parseOpeningHours(p.openingHours));
}

const hoursError = (reply, place) =>
  reply.code(400).send({
    error: 'bad_request',
    message: `Ish vaqti formati tushunarsiz: "${place.openingHours}". Masalan: Mo-Fr 09:00-18:00; Sa 10:00-14:00`,
  });

const notFound = (reply) => reply.code(404).send({ error: 'not_found', message: 'Topilmadi' });

export default async function adminRoutes(app, { repos, chat }) {
  app.addHook('onRequest', app.requireAdmin);

  app.get('/stats', async () => {
    const places = repos.places.list();
    const byCategory = {};
    for (const p of places) byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
    const avgRating = places.length
      ? places.reduce((sum, p) => sum + p.rating, 0) / places.length
      : 0;
    return {
      places: places.length,
      reviews: repos.reviews.count(),
      hiddenReviews: repos.reviews.count('hidden'),
      openReports: repos.reports.count('open'),
      averageRating: Math.round(avgRating * 100) / 100,
      byCategory,
    };
  });

  app.post('/places', { schema: { body: placeCreateSchema } }, async (request, reply) => {
    if (badHours([request.body])) return hoursError(reply, request.body);
    return reply.code(201).send(repos.places.create(request.body));
  });

  app.put(
    '/places/:id',
    { schema: { params: idParams, body: placeUpdateSchema } },
    async (request, reply) => {
      if (badHours([request.body])) return hoursError(reply, request.body);
      return repos.places.update(request.params.id, request.body) ?? notFound(reply);
    },
  );

  app.delete('/places/:id', { schema: { params: idParams } }, async (request, reply) => {
    if (!repos.places.remove(request.params.id)) return notFound(reply);
    return reply.code(204).send();
  });

  app.get('/places/export', async (_request, reply) => {
    const date = new Date().toISOString().slice(0, 10);
    reply.header('content-disposition', `attachment; filename="milliy-places-${date}.json"`);
    return repos.places.exportAll();
  });

  app.post(
    '/places/import',
    { schema: { body: placesImportSchema }, bodyLimit: 10 * 1024 * 1024 },
    async (request, reply) => {
      const unreadable = badHours(request.body);
      if (unreadable) return hoursError(reply, unreadable);
      const ids = request.body.map((p) => p.id).filter(Boolean);
      if (new Set(ids).size !== ids.length) {
        const err = new Error("Takrorlanuvchi ID'lar mavjud");
        err.statusCode = 400;
        throw err;
      }
      return { imported: repos.places.replaceAll(request.body) };
    },
  );

  app.get(
    '/reviews',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: { status: { type: 'string', enum: ['published', 'hidden'] } },
        },
      },
    },
    async (request) => repos.reviews.list({ status: request.query.status }),
  );

  app.patch(
    '/reviews/:id',
    {
      schema: {
        params: idParams,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['status'],
          properties: { status: { type: 'string', enum: ['published', 'hidden'] } },
        },
      },
    },
    async (request, reply) =>
      repos.reviews.setStatus(request.params.id, request.body.status) ?? notFound(reply),
  );

  app.get(
    '/reports',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: { status: { type: 'string', enum: REPORT_STATUSES } },
        },
      },
    },
    async (request) => repos.reports.list({ status: request.query.status }),
  );

  app.patch(
    '/reports/:id',
    {
      schema: {
        params: idParams,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['status'],
          properties: { status: { type: 'string', enum: REPORT_STATUSES } },
        },
      },
    },
    async (request, reply) =>
      repos.reports.setStatus(request.params.id, request.body.status) ?? notFound(reply),
  );

  app.delete('/reviews/:id', { schema: { params: idParams } }, async (request, reply) => {
    if (!repos.reviews.remove(request.params.id)) return notFound(reply);
    return reply.code(204).send();
  });

  app.get('/settings/chat', async () => ({
    provider: chat.provider,
    model: chat.model,
    configured: chat.configured,
    systemPrompt: repos.settings.get('chat.systemPrompt', DEFAULT_SYSTEM_PROMPT),
  }));

  app.put(
    '/settings/chat',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['systemPrompt'],
          properties: { systemPrompt: { type: 'string', minLength: 10, maxLength: 4000 } },
        },
      },
    },
    async (request) => {
      repos.settings.set('chat.systemPrompt', request.body.systemPrompt.trim());
      return { systemPrompt: repos.settings.get('chat.systemPrompt') };
    },
  );
}
