import { FastifyInstance } from "fastify";
import { AuthDto, GoogleAccountDto } from "../dto/auth.dto.js";
import { UserEntity } from "../entities/user.entity.js";
import { AppError } from "../errors/error.handler.js";
import { ResultsEntity } from "../entities/results.entity.js";

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
    throw new AppError('Failed to create user', 500, 'user_create_failed');
  }
}

export async function createGoogleUser(fastify: FastifyInstance, userData: GoogleAccountDto){
  const userRepository = fastify.orm.getRepository(UserEntity);
  
  try {
    const newGoogleUser = userRepository.create({
      email: userData.email,
      googleId: userData.googleId,
      isVerified: true,
      password: null
    });

    return await userRepository.save(newGoogleUser);
  } catch (err) {
    throw new AppError('Failed to create user', 500, 'user_create_failed');
  }
}

export async function updateUserEmail(fastify: FastifyInstance, uuid: string, newEmail: string){
  const userRepository = fastify.orm.getRepository(UserEntity);
  try {
    await userRepository.update({ id: uuid }, { email: newEmail });
  } catch (err) {
    throw new AppError('Failed to update email', 500, 'email_update_failed');
  }
}

export async function deleteUser(fastify: FastifyInstance, uuid: string){
  const userRepository = fastify.orm.getRepository(UserEntity);
  const resultsRepository = fastify.orm.getRepository(ResultsEntity);

  const user = await userRepository.findOne({ where: { id: uuid } });
  if(!user) throw new AppError('User not found!', 404, 'not_found');

  await resultsRepository.delete({ uuid });
  await userRepository.delete({ id: uuid });
}