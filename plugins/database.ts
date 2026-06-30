import 'dotenv/config'
import fastifyPostgres from '@fastify/postgres';
import fastifyPlugin from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

async function dbConnector(fastify: FastifyInstance){
  fastify.register(fastifyPostgres, {
    connectionString: process.env.DB_CONNECTION
  })
}

export default fastifyPlugin(dbConnector);