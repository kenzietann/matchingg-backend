import { DataSource } from 'typeorm';

declare module 'fastify' {
  interface FastifyInstance {
    orm: DataSource;
  }
}
