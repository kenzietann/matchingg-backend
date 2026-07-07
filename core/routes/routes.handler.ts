import { FastifyInstance } from "fastify";
import authRoutes from "./auth.routes.js";

export default async function routes(fastify: FastifyInstance){
  fastify.register(authRoutes, { prefix: '/auth' });
}