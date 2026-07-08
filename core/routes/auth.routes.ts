import { FastifyInstance } from "fastify";
import { AuthDto } from "../dto/auth.dto.js";
import { createUser, verifyEmail } from "../services/auth.service.js";

export default async function authRoutes(fastify: FastifyInstance){
  fastify.post('/signup', async (req, res) => {
    const userData = req.body as AuthDto;
    await createUser(fastify, userData);
    return res.code(200).send('')
  });

  fastify.get('/verify-email', async (req, res) => {
    const { token } = req.query as { token: string };
    await verifyEmail(fastify, token);
    return res.code(200).send({ message: 'Email verified successfully' })
  })
}