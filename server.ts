import "reflect-metadata";
import "dotenv/config"
import Fastify from 'fastify';
import routes from "./core/routes/routes.handler.js";
import { dbConnector } from './plugins/database.js';
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyRedis from "@fastify/redis";
import fastifyCors from "@fastify/cors";
import multipart from '@fastify/multipart';
import { multipartRegister } from "./plugins/multipart.js";

const fastify = Fastify({
  logger: true
});

await dbConnector(fastify);
multipartRegister(fastify);
fastify.register(fastifyCors, {
  origin: 'http://localhost:4200',
  credentials: true
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