import { FastifyInstance } from "fastify";

export async function rateLimit(fastify: FastifyInstance, key: string, ttlSeconds: number): Promise<number> {
  const count = await fastify.redis.incr(key);
  if(count === 1) await fastify.redis.expire(key, ttlSeconds);
  return count;
}