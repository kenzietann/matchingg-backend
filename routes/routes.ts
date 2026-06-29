import { FastifyInstance } from "fastify";

async function routes(fastify: FastifyInstance){
  fastify.get('/', async (req, res) => {
    return { hello: "World" }
  })

  fastify.post('/login', async (req, res) => {
    return "Login Successful";
  })
}

export default routes;