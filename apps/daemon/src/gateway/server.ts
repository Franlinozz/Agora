import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import { authMiddleware } from './middleware/auth.ts';
import { registerRouteRateLimits } from './middleware/rate-limit.ts';
import agentsRoutes from './routes/agents.ts';
import chatRoutes from './routes/chat.ts';
import contactRoutes from './routes/contact.ts';
import escrowsRoutes from './routes/escrows.ts';
import eventsRoutes from './routes/events.ts';
import leaderboardRoutes from './routes/leaderboard.ts';
import statsRoutes from './routes/stats.ts';
import subscribeRoutes from './routes/subscribe.ts';

export async function buildServer() {
  const app = Fastify({
    logger:
      process.env.NODE_ENV === 'production'
        ? { level: process.env.LOG_LEVEL ?? 'info' }
        : {
            level: process.env.LOG_LEVEL ?? 'info',
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard' },
            },
          },
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: ['https://agora.example.com', 'http://localhost:3000'],
  });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await registerRouteRateLimits(app);

  app.addHook('onRequest', authMiddleware);
  app.get('/health', async () => ({ ok: true }));

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
