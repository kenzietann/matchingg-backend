import { FastifyInstance } from "fastify";
import { UserEntity } from "../entities/user/user.entity.js";

export async function routes(fastify: FastifyInstance){
  fastify.get('/', async (req, res) => {
    const userRepository = fastify.orm.getRepository(UserEntity);

    const users = await userRepository.find();

    return users;
  });
}