import { FastifyInstance } from "fastify";
import { UserEntity } from "../entities/user.entity.js";
import { AppError } from "../errors/error.handler.js";
import { sendVerificationEmail } from "./resend.service.js";
import bcrypt from 'bcrypt';

export async function getEmailAndPlan(fastify: FastifyInstance, uuid: string){
  const userRepository = fastify.orm.getRepository(UserEntity);
  
  const user = await userRepository.findOne({ where: { id: uuid } });
  if(!user) throw new AppError('User not found!', 404, 'not_found');

  return {
    userEmail: user.email,
    userPlan: user.plan
  };
}

export async function changeEmail(fastify: FastifyInstance, uuid: string, newEmail: string){
  const userRepository = fastify.orm.getRepository(UserEntity);
  
  const user = await userRepository.findOne({ where: { id: uuid } });
  if(!user) throw new AppError('User not found!', 404, 'not_found');

  const email = await userRepository.findOne({ where: { email: newEmail } });
  if(email) throw new AppError('Email already taken!', 409, 'email_taken');

  const token = fastify.jwt.sign(
    { type: 'email-change' },
    { expiresIn: '15m' }
  );

  const pendingData = { uuid, newEmail };

  await fastify.redis.set(`pending:${token}`, JSON.stringify(pendingData), 'EX', 900);

  const magicLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  await sendVerificationEmail(newEmail, magicLink);

  return { message: 'Check your new email inbox!' };
}

export async function changePassword(fastify: FastifyInstance, uuid: string, userPassword: { currentPassword: string, newPassword: string }){
  const userRepository = fastify.orm.getRepository(UserEntity);

  const user = await userRepository.findOne({ where: { id: uuid } });
  if(!user) throw new AppError('User not found!', 404, 'not_found');

  const isMatch = await bcrypt.compare(userPassword.currentPassword, user.password);

  if(!isMatch) throw new AppError('Incorrect current password', 401, 'invalid_credentials');

  const newPasswordHashed = await bcrypt.hash(userPassword.newPassword, 12);
  await userRepository.update({ id: uuid }, { password: newPasswordHashed });

  return { message: 'Password successfully changed!' };
}