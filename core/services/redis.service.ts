import { FastifyInstance } from "fastify";

export async function set(fastify: FastifyInstance, key: string, value: string, ttlSeconds: number){
  await fastify.redis.set(key, value, 'EX', ttlSeconds);
}

export async function get(fastify: FastifyInstance, key: string){
  return fastify.redis.get(key);
}

export async function del(fastify: FastifyInstance, key: string){
  await fastify.redis.del(key);
}

export async function rateLimit(fastify: FastifyInstance, key: string, ttlSeconds: number): Promise<number> {
  const count = await fastify.redis.incr(key);
  if(count === 1) await fastify.redis.expire(key, ttlSeconds);
  return count;
}