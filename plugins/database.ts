import 'reflect-metadata';
import 'dotenv/config';
import { FastifyInstance } from 'fastify';
import { DataSource } from 'typeorm';
import { UserEntity } from '../core/entities/user.entity.js';
import { ResultsEntity } from '../core/entities/results.entity.js';
import { env } from '../core/env.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.dbConnection,
  synchronize: false,
  logging: false,
  entities: [UserEntity, ResultsEntity],
  migrations: [join(__dirname, '../migrations/**/*{.js,.ts}')]
});

export async function dbConnector(fastify: FastifyInstance) {
  await AppDataSource.initialize();
  fastify.decorate('orm', AppDataSource);
}
