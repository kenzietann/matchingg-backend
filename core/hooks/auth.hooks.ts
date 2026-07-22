import { FastifyRequest, FastifyReply } from 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub?: string; plan?: string; type?: string }
    user: { sub?: string; plan?: string; type?: string }
  }
}

export async function authenticate(req: FastifyRequest, res: FastifyReply) {
  try {
    await req.jwtVerify();
    if(req.user.type !== 'login' || !req.user.sub) return res.code(401).send({ message: 'Unauthorized' });
  } catch(err) {
    res.code(401).send({ message: 'Unauthorized' });
  }
}