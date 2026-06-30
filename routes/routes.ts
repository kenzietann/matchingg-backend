import { FastifyInstance } from "fastify";

async function routes(fastify: FastifyInstance){
  fastify.get('/', async (req, res) => {
    return { hello: "World" }
  });

  fastify.get('/db', async (req, res) => {
    await fastify.pg.query('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(255))');
    await fastify.pg.query("INSERT INTO users (name) VALUES ('Kenzie Tandera')");
    const result = await fastify.pg.query('SELECT * FROM users');
    return result.rows;
  });
}

export default routes;