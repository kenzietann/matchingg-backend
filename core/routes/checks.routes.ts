import { FastifyInstance } from "fastify";
import { compatibilityScore, extract, saveCachedResult } from "../services/checks.service.js";
import { authenticate } from "../hooks/auth.hooks.js";
import { ResultsEntity } from "../entities/results.entity.js";

export default async function checksRoutes(fastify: FastifyInstance){
  fastify.post('/extract', {
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '10 minutes'
      }
    } 
  }, async(req, res) => {
    const userCV = await req.file();
    if(!userCV) return res.code(400).send({ error: 'No file uploaded', code: 'no_file' });

    const fileMimeType = userCV.mimetype;

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if(!allowedMimeTypes.includes(fileMimeType)) return res.code(415).send({ error: 'Unsupported file type', code: 'unsupported_file' });

    const buffer = await userCV.toBuffer();

    const text = await extract(buffer, fileMimeType);
    return res.code(200).send({ text });
  });

  fastify.post<{Body: { cvText: string; jdText: string; } }>('/', {
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '10 minutes'
      }
    } 
  }, async (req, res) => {
    const { cvText, jdText } = req.body;
    const result = await compatibilityScore(cvText, jdText);

    const cacheKey = crypto.randomUUID();
    await fastify.redis.set(`check:${cacheKey}`, JSON.stringify(result), 'EX', 1800);

    return res.code(200).send({ result, cacheKey });
  });

  fastify.post('/save', { 
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '10 minutes'
      }
    }
  }, async (req, res) => {
    const userId = req.user.sub!;
    const response = req.body as { cacheKey: string };
    try {
      await saveCachedResult(fastify, userId, response.cacheKey);
    } catch (err: any) {
      if (err?.driverError?.code === '23505' || err?.code === '23505') {
        return res.code(200).send('The result data has been saved!');
      }
      throw err;
    }
    return res.code(201).send('The result data has been saved!');
  });

  fastify.get<{ Params: { cacheKey: string } }>('/:cacheKey', { 
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute'
      }
    }
  }, async (req, res) => {
      const { cacheKey } = req.params;
      const cached = await fastify.redis.get(`check:${cacheKey}`);
      if (cached) return res.code(200).send({ result: JSON.parse(cached), cacheKey, isSaved: false });

      const repo = fastify.orm.getRepository(ResultsEntity);
      const saved = await repo.findOne({ where: { cacheKey } });
      if (!saved) return res.code(404).send({ error: 'Result not found or expired', code: 'result_not_found' });

      const { id, uuid, createdAt, cacheKey: _ck, ...result } = saved;
      return res.code(200).send({ result, cacheKey, isSaved: true });
    }
  )
}