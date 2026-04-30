import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import { loggerOptions } from '../lib/logger.ts';

import { authMiddleware } from './middleware/auth.ts';
import { registerRouteRateLimits } from './middleware/rate-limit.ts';
import agentsRoutes from './routes/agents.ts';
import chatRoutes from './routes/chat.ts';
import contactRoutes from './routes/contact.ts';
import escrowsRoutes from './routes/escrows.ts';
import eventsRoutes from './routes/events.ts';
import healthRoutes from './routes/health.ts';
import leaderboardRoutes from './routes/leaderboard.ts';
import statsRoutes from './routes/stats.ts';
import subscribeRoutes from './routes/subscribe.ts';

export async function buildServer() {
  const app = Fastify({ logger: loggerOptions });

  await app.register(helmet);
  await app.register(cors, {
    origin: ['https://agora.example.com', 'http://localhost:3000'],
  });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await registerRouteRateLimits(app);

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ error }, 'Gateway request failed');
    void reply.code(error.statusCode ?? 500).send({ error: error.message || 'Internal error' });
  });

  app.addHook('onRequest', authMiddleware);

  await app.register(healthRoutes);
  await app.register(statsRoutes, { prefix: '/stats' });
  await app.register(agentsRoutes, { prefix: '/agents' });
  await app.register(escrowsRoutes, { prefix: '/escrows' });
  await app.register(leaderboardRoutes, { prefix: '/leaderboard' });
  await app.register(eventsRoutes, { prefix: '/events' });
  await app.register(chatRoutes, { prefix: '/chat' });
  await app.register(subscribeRoutes, { prefix: '/subscribe' });
  await app.register(contactRoutes, { prefix: '/contact' });

  return app;
}
