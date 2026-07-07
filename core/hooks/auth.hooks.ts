import { FastifyRequest, FastifyReply } from 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: number; email: string }
    user: { userId: number; email: string }
  }
}

export async function authenticate(req: FastifyRequest, res: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch(err) {
    res.code(401).send({ message: 'Unauthorized' });
  }
}