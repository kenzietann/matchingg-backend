import { FastifyRequest, FastifyReply } from 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId?: number; email: string; type?: string }
    user: { userId?: number; email: string; type?: string }
  }
}

export async function authenticate(req: FastifyRequest, res: FastifyReply) {
  try {
    await req.jwtVerify();
    if(req.user.type !== 'login' || !req.user.userId) return res.code(401).send({ message: 'Unauthorized' });
  } catch(err) {
    res.code(401).send({ message: 'Unauthorized' });
  }
}