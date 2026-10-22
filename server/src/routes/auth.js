export default async function authRoutes(app) {
  app.post(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', minLength: 1, maxLength: 64 },
            password: { type: 'string', minLength: 1, maxLength: 128 },
          },
        },
      },
      config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
      const { username, password } = request.body;
      if (!(await app.verifyAdminCredentials(username, password))) {
        request.log.warn({ username }, 'failed admin login');
        return reply.code(401).send({ error: 'invalid_credentials', message: "Login yoki parol noto'g'ri" });
      }
      const token = await reply.jwtSign({ sub: username, role: 'admin' });
      reply.setSession(token);
      return { username };
    },
  );

  app.get('/me', { preHandler: app.requireAdmin }, async (request) => ({
    username: request.user.sub,
  }));

  app.post('/logout', async (_request, reply) => {
    reply.clearSession();
    return reply.code(204).send();
  });
}
