import { FastifyInstance } from "fastify";
import { AuthDto } from "../dto/auth.dto.js";
import { loginUser, signup, verifyEmail } from "../services/auth.service.js";
import { authenticate } from "../hooks/auth.hooks.js";
import { rateLimit } from "../services/ratelimit.js";
import { AppError } from "../errors/error.handler.js";

export default async function authRoutes(fastify: FastifyInstance){
  fastify.post('/signup', async (req, res) => {
    const userData = req.body as AuthDto;
    await signup(fastify, req.ip, userData);
    return res.code(200).send('')
  });

  fastify.get('/verify-email', async (req, res) => {
    const { token } = req.query as { token: string };
    await verifyEmail(fastify, token);
    return res.code(200).send({ message: 'Email verified successfully' });
  });


  fastify.post('/login', async(req, res) => {
    const userData = req.body as AuthDto;
    const token = await loginUser(fastify, req.ip, userData);

    res.cookie('token', token.token, {
      httpOnly: true,
      secure: true, 
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return res.code(200).send({ message: token.message });
  });

  fastify.get('/me', {
     preHandler: authenticate
    }, async(req, res) => {
      const check_auth_ratelimit_key = `ratelimit:checkauth:${req.ip}`;
      const attempts = await rateLimit(fastify, check_auth_ratelimit_key, 60);
      if(attempts >= 20) return res.code(429).send({ message: 'Too many requests' });
      return res.code(200).send({ message: 'Authenticated' });
  });

  fastify.post('/logout', async(req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      path: '/',
    });
    return res.code(200).send({ message: "Logged out successfully" });
  });
}