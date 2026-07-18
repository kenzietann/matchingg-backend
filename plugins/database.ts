import 'reflect-metadata';
import 'dotenv/config';
import { FastifyInstance } from 'fastify';
import { DataSource } from 'typeorm';
import { UserEntity } from '../core/entities/user.entity.js';
import { ResultsEntity } from '../core/entities/results.entity.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'kenkzuha',
  password: '',
  database: 'matchingg',
  synchronize: true,
  logging: false,
  entities: [UserEntity, ResultsEntity],
});

export async function dbConnector(fastify: FastifyInstance) {
  await AppDataSource.initialize();
  fastify.decorate('orm', AppDataSource);
}
