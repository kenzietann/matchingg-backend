import { FastifyInstance } from "fastify";
import multipart from '@fastify/multipart';

export async function multipartRegister(fastify: FastifyInstance){
  fastify.register(multipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 10000,
      fields: 1,
      fileSize: 10000000,
      files: 1,
    }
  });
}