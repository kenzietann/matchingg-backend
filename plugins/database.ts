import fastifyPostgres from '@fastify/postgres';
import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

async function dbConnector(fastify: FastifyInstance){
  fastify.register(fastifyPostgres, {
    connectionString: 'postgres://kenkzuha@localhost/matchingg'
  })
}

export default fastifyPlugin(dbConnector);