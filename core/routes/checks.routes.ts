import { FastifyInstance } from "fastify";
import { extract } from "../services/checks.service.js";



export default async function checksRoutes(fastify: FastifyInstance){
  fastify.post('/extract', async(req, res) => {
    const userCV = await req.file();
    if(!userCV) return res.code(400).send({ error: 'No file uploaded' });

    const fileMimeType = userCV.mimetype;

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if(!allowedMimeTypes.includes(fileMimeType)) return res.code(415).send({ error: 'Unsupported file type' });

    const buffer = await userCV.toBuffer();

    const text = await extract(buffer, fileMimeType);
    return res.code(200).send({ text });
  });
}