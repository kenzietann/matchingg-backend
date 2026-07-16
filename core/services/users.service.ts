import { FastifyInstance } from "fastify";
import { AuthDto } from "../dto/auth.dto.js";
import { UserEntity } from "../entities/user.entity.js";
import { AppError } from "../errors/error.handler.js";

export async function createVerifiedUser(fastify: FastifyInstance, userData: AuthDto){
  const userRepository = fastify.orm.getRepository(UserEntity);
  try {
    const user = userRepository.create({
      email: userData.email,
      password: userData.password,
      isVerified: true
    });
    await userRepository.save(user);
  } catch (err) {
    throw new AppError('Failed to create user', 500);
  }
}