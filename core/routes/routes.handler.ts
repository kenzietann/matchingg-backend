import { FastifyInstance } from "fastify";
import authRoutes from "./auth.routes.js";
import checksRoutes from "./checks.routes.js";
import { historyRoutes } from "./history.routes.js";

export default async function routes(fastify: FastifyInstance){
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(checksRoutes, { prefix: '/checks' });
  fastify.register(historyRoutes, { prefix: '/history' });
}