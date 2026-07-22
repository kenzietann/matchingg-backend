import { FastifyInstance } from "fastify";
import { authenticate } from "../hooks/auth.hooks.js";
import { getHistory } from "../services/history.service.js";
import { ResultsEntity } from "../entities/results.entity.js";

export async function historyRoutes(fastify: FastifyInstance){
  fastify.get('/', { 
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute'
      }
    }
  }, async (req, res) => {
    const userId = req.user.sub!;
    const result = await getHistory(fastify, userId);
    return res.code(200).send(result);
  });

  fastify.delete<{ Params: { id: string } }>('/:id', { 
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 15,
        timeWindow: '5 minutes'
      }
    }
  }, async (req, res) => {
    const uuid = req.user.sub!;
    const id = req.params.id;

    const repo = fastify.orm.getRepository(ResultsEntity);
    const item = await repo.findOne({ where: { id, uuid } });
    if (!item) return res.code(404).send({ error: 'Not found', code: 'not_found' });

    await repo.remove(item);
    return res.code(200).send({ message: 'Deleted' });
  });
}