import type { FastifyReply, FastifyRequest } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (request.url === '/health' || request.url.startsWith('/health?')) return;
  if (request.url === '/health/deep' || request.url.startsWith('/health/deep?')) return;

  const expected = process.env.API_GATEWAY_SECRET;
  if (!expected && process.env.NODE_ENV !== 'production') return;

  const received = request.headers['x-gateway-secret'];
  const secret = Array.isArray(received) ? received[0] : received;

  if (!expected || secret !== expected) {
    await reply.code(403).send({ error: 'Forbidden' });
  }
}
