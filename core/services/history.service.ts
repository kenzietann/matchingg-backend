import { FastifyInstance } from "fastify";
import { ResultsEntity } from "../entities/results.entity.js";

export async function getHistory(fastify: FastifyInstance, uuid: string){
  const checksRepository = fastify.orm.getRepository(ResultsEntity);

  const userData = await checksRepository.find({
    where: { uuid }, 
    select: ['id', 'jobTitle', 'companyName', 'score', 'label', 'percentile', 'createdAt', 'cacheKey'],
    order: { createdAt: 'DESC' } 
  });

  return userData;
}