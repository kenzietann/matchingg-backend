import 'reflect-metadata';
import 'dotenv/config'
import { FastifyInstance } from 'fastify';
import dbConnection from 'typeorm-fastify-plugin';
import { UserEntity } from '../entities/user/user.entity.js';

export async function dbConnector(fastify: FastifyInstance){
  fastify.register(fastifyPostgres, {
    connectionString: process.env.DB_CONNECTION
  })
}