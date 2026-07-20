import { FastifyInstance } from "fastify";
import { authenticate } from "../hooks/auth.hooks.js";
import { getHistory } from "../services/history.service.js";
import { ResultsEntity } from "../entities/results.entity.js";

export async function historyRoutes(fastify: FastifyInstance){
  fastify.get('/', { preHandler: authenticate }, async (req, res) => {
    const userId = req.user.userId!;
    const result = await getHistory(fastify, userId);
    return res.code(200).send(result);
  });

  fastify.delete<{ Params: { id: string } }>('/:id', { preHandler: authenticate }, async (req, res) => {
    const userId = req.user.userId!;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.code(400).send({ error: 'Invalid id' });

    const repo = fastify.orm.getRepository(ResultsEntity);
    const item = await repo.findOne({ where: { id, userId } });
    if (!item) return res.code(404).send({ error: 'Not found' });

    await repo.remove(item);
    return res.code(200).send({ message: 'Deleted' });
  });
}