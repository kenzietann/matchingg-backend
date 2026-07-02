import "reflect-metadata";
import Fastify from 'fastify';
import { routes } from './routes/routes.js';
import { dbConnector } from './plugins/database.js';

const fastify = Fastify({
  logger: true
})

dbConnector(fastify);
fastify.register(routes);

try {
  await fastify.listen({ port: 3002, host: '0.0.0.0' });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}