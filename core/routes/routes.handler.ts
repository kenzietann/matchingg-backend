import { FastifyInstance } from "fastify";
import authRoutes from "./auth.routes.js";
import checksRoutes from "./checks.routes.js";

export default async function routes(fastify: FastifyInstance){
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(checksRoutes, { prefix: '/checks' });
}