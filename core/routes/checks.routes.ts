import { FastifyInstance } from "fastify";
import { compatibilityScore, extract, saveCachedResult } from "../services/checks.service.js";
import { rateLimit } from "../services/redis.service.js";
import { authenticate } from "../hooks/auth.hooks.js";
import { AppError } from "../errors/error.handler.js";
import { ResultsEntity } from "../entities/results.entity.js";

export default async function checksRoutes(fastify: FastifyInstance){
  fastify.post('/extract', { preHandler: authenticate }, async(req, res) => {
    const userCV = await req.file();
    if(!userCV) return res.code(400).send({ error: 'No file uploaded' });

    const fileMimeType = userCV.mimetype;

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if(!allowedMimeTypes.includes(fileMimeType)) return res.code(415).send({ error: 'Unsupported file type' });

    const buffer = await userCV.toBuffer();

    const text = await extract(buffer, fileMimeType);
    return res.code(200).send({ text });
  });

  fastify.post<{Body: { cvText: string; jdText: string; } }>('/', { preHandler: authenticate }, async (req, res) => {
    const rateLimitKey = `ratelimit:checks:${req.ip}`;
    const attempts = await rateLimit(fastify, rateLimitKey, 600);
    if (attempts > 3) return res.code(429).send({ error: 'Too many requests. please wait 10 minutes' });


    const { cvText, jdText } = req.body;
    const result = await compatibilityScore(cvText, jdText);

    const cacheKey = crypto.randomUUID();
    await fastify.redis.set(`check:${cacheKey}`, JSON.stringify(result), 'EX', 1800);

    return res.code(200).send({ result, cacheKey });
  });

  fastify.post('/save', { preHandler: authenticate }, async (req, res) => {
    const userId = req.user.userId!;
    const response = req.body as { cacheKey: string };
    await saveCachedResult(fastify, userId, response.cacheKey);

    return res.code(201).send('The result data has been saved!');
  });

  fastify.get<{ Params: { cacheKey: string } }>('/:cacheKey', { preHandler: authenticate },
    async (req, res) => {
      const { cacheKey } = req.params;
      const cached = await fastify.redis.get(`check:${cacheKey}`);
      if (cached) return res.code(200).send({ result: JSON.parse(cached), cacheKey, isSaved: false });

      const repo = fastify.orm.getRepository(ResultsEntity);
      const saved = await repo.findOne({ where: { cacheKey } });
      if (!saved) return res.code(404).send({ error: 'Result not found or expired' });

      const { id, userId, createdAt, cacheKey: _ck, ...result } = saved;
      return res.code(200).send({ result, cacheKey, isSaved: true });
    }
  )
}