import { FastifyInstance } from "fastify";
import { AuthDto } from "../dto/auth.dto.js";
import { createUser } from "../services/auth.service.js";

export default async function authRoutes(fastify: FastifyInstance){
  fastify.post('/signup', async (req, res) => {
    const userData = req.body as AuthDto;
    await createUser(userData);
  });

}