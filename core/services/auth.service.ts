import { FastifyInstance } from "fastify";
import { AuthDto, EmailChangeDto } from "../dto/auth.dto.js";
import { UserEntity } from "../entities/user.entity.js";
import { AppError } from "../errors/error.handler.js";
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from "./resend.service.js";
import { createVerifiedUser, updateUserEmail } from "./users.service.js";

export async function signup(fastify: FastifyInstance, userData: AuthDto){
  const userRepository = fastify.orm.getRepository(UserEntity);
  const existingEmail = await userRepository.findOne({ where: { email: userData.email } });

  if(existingEmail) throw new AppError('Email already taken', 409, 'email_taken');

  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const token = fastify.jwt.sign(
    { type: 'email-verify' },
    { expiresIn: '15m' }
  );

  const pendingData: AuthDto = {
    email: userData.email,
    password: hashedPassword
  };

  await fastify.redis.set(`pending:${token}`, JSON.stringify(pendingData), "EX", 900);
  
  const magicLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  await sendVerificationEmail(userData.email, magicLink);

  return { message: 'Account created! Please check your email to verify your account' };
}

export async function verifyEmail(fastify: FastifyInstance, token: string){
  const userRepository = fastify.orm.getRepository(UserEntity);
  let payload: any;

  try {
    payload = await fastify.jwt.verify(token);
  } catch {
    throw new AppError('Invalid or expired verification link', 401, 'invalid_token');
  }

  if(payload.type !== 'email-verify' && payload.type !== 'email-change') throw new AppError('Invalid token type', 401, 'invalid_token_type');

  const pendingJson = await fastify.redis.get(`pending:${token}`);

  if (!pendingJson) throw new AppError('Verification link already used or expired', 401, 'link_used');

  await fastify.redis.del(`pending:${token}`);

  if(payload.type === 'email-verify'){
    const pending: AuthDto = JSON.parse(pendingJson);

    const existingEmail = await userRepository.findOne({ where: { email: pending.email } });
    if(existingEmail) throw new AppError('Email already taken', 409, 'email_taken');

    await createVerifiedUser(fastify, pending);
  } else {
    const pending: EmailChangeDto = JSON.parse(pendingJson);

    const existingEmail = await userRepository.findOne({ where: { email: pending.newEmail } });
    if(existingEmail) throw new AppError('Email already taken', 409, 'email_taken');

    await updateUserEmail(fastify, pending.uuid, pending.newEmail);
  }
}

export async function loginUser(fastify: FastifyInstance, userData: AuthDto){
  const userRepository = fastify.orm.getRepository(UserEntity);
  const userByEmail = await userRepository.findOne({ where: { email: userData.email } });
  if(!userByEmail){
    throw new AppError('Credentials invalid', 404, 'invalid_credentials');
  }

  const isMatch = await bcrypt.compare(userData.password, userByEmail.password);
  if(!isMatch){
    throw new AppError('Credentials invalid', 404, 'invalid_credentials');
  }

  const jwtPayload = {
    sub: userByEmail.id, 
    plan: userByEmail.plan,
    type: 'login'
  };

  return {
    message: 'Login Successful!',
    token: fastify.jwt.sign(jwtPayload)
  }
}