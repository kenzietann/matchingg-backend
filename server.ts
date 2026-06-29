import Fastify from 'fastify';
import routes from './routes/routes.js';

const fastify = Fastify({
  logger: true
})

fastify.register(routes);

fastify.listen({ port: 3001, host: '0.0.0.0' }, (err, address) => {
  if(err){
    fastify.log.error(err);
  }
  fastify.log.info(`Server is Listening on ${address}`)
})