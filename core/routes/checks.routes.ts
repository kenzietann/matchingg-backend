import { FastifyInstance } from "fastify";
import { compatibilityScore, extract } from "../services/checks.service.js";
import { rateLimit } from "../services/redis.service.js";
import { authenticate } from "../hooks/auth.hooks.js";

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
    return res.code(200).send(result);
  });
}