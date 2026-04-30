import type { FastifyInstance } from 'fastify';

export async function registerRouteRateLimits(_app: FastifyInstance): Promise<void> {
  // Per-route limits are attached directly to route config where needed.
}
