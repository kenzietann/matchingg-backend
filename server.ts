import "reflect-metadata";
import "dotenv/config"
import Fastify from 'fastify';
import routes from "./core/routes/routes.handler.js";
import { dbConnector } from './plugins/database.js';
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyRedis from "@fastify/redis";
import fastifyCors from "@fastify/cors";
import rateLimit from '@fastify/rate-limit';
import { multipartRegister } from "./plugins/multipart.js";
import { AppError } from "./core/errors/error.handler.js";
import fastifyHelmet from "@fastify/helmet";

const fastify = Fastify({
  logger: true
});

fastify.setErrorHandler((error: Error & { statusCode?: number }, req, reply) => {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.message,
      message: error.message,
      code: error.code,
    });
  }

  if (error.statusCode === 429) {
    return reply.code(429).send({
      statusCode: 429,
      error: 'Too Many Requests',
      message: error.message,
      code: 'rate_limited',
    });
  }

  fastify.log.error(error);
  return reply.code(error.statusCode ?? 500).send({
    statusCode: error.statusCode ?? 500,
    error: 'Internal Server Error',
    message: error.message,
  });
});

await dbConnector(fastify);
fastify.register(rateLimit, {
  global: false
});
multipartRegister(fastify);
fastify.register(fastifyCors, {
  origin: ['https://matchingg.com', 'https://www.matchingg.com', 'localhost:4200', '127.0.0.1:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

fastify.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],  
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  }
});

fastify.register(fastifyCookie);
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
  cookie: {
    cookieName: 'token',
    signed: false
  }
});
fastify.register(fastifyRedis, {
  url: 'redis://127.0.0.1',
  closeClient: true
});

fastify.register(routes);

try {
  await fastify.listen({ port: 3002, host: '0.0.0.0' });
} catch (err) {
  fastify.log.error(err); 
  process.exit(1);
}