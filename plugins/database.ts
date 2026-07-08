import 'reflect-metadata';
import 'dotenv/config'
import { FastifyInstance } from 'fastify';
import dbConnection from 'typeorm-fastify-plugin';
import { UserEntity } from '../core/entities/user.entity.js';

export async function dbConnector(fastify: FastifyInstance){
  fastify.register(dbConnection, {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'kenkzuha',
    password: '',
    database: 'matchingg',
    synchronize: true,
    logging: false,
    entities: [UserEntity],
  });
}