import { FastifyInstance } from "fastify";
import { AuthDto } from "../dto/auth.dto.js";
import { UserEntity } from "../entities/user.entity.js";
import { rateLimit } from "./redis.service.js";
import { AppError } from "../errors/error.handler.js";
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from "./resend.service.js";
import { createVerifiedUser } from "./users.service.js";

export async function signup(fastify: FastifyInstance, userIp: string, userData: AuthDto){
  const signupRateKey = `ratelimit:signup:${userIp}`;
  const attempts = await rateLimit(fastify, signupRateKey, 3600);

  if(attempts >= 3) throw new AppError('Too many requests. Please wait before trying again', 429);

  const userRepository = fastify.orm.getRepository(UserEntity);
  const existingEmail = await userRepository.findOne({ where: { email: userData.email } });

  if(existingEmail) throw new AppError('Email already taken', 409);

  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const token = await fastify.jwt.sign(
    { email: userData.email, type: 'email-verify' },
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
    throw new AppError('Invalid or expired verification link', 401);
  }

  if(payload.type !== 'email-verify') throw new AppError('Invalid token type', 401);

  const pendingJson = await fastify.redis.get(`pending:${token}`);

  if (!pendingJson) throw new AppError('Verification link already used or expired', 401);

  const pending: AuthDto = JSON.parse(pendingJson);

  const existingEmail = await userRepository.findOne({ where: { email: pending.email } });
  if(existingEmail) throw new AppError('Email already taken', 409);

  await fastify.redis.del(`pending:${token}`);
  await createVerifiedUser(fastify, pending);
}

export async function loginUser(fastify: FastifyInstance, userIp: string, userData: AuthDto){
  const loginRateKey = `ratelimit:login:${userIp}`;
  const attempts = await fastify.redis.get(loginRateKey);

  if(attempts && Number(attempts) >= 5) throw new AppError('Too many requests. Please wait 15 minute before trying again', 429);

  const userRepository = fastify.orm.getRepository(UserEntity);
  const userByEmail = await userRepository.findOne({ where: { email: userData.email } });
  if(!userByEmail){
    await rateLimit(fastify, loginRateKey, 900);
    throw new AppError('Credentials invalid', 404);
  }

  const isMatch = await bcrypt.compare(userData.password, userByEmail.password);
  if(!isMatch){
    await rateLimit(fastify, loginRateKey, 900);
    throw new AppError('Credentials invalid', 404);
  }
  await fastify.redis.del(loginRateKey);

  const jwtPayload = {
    userId: userByEmail.id, 
    email: userByEmail.email,
    type: 'login'
  };

  return {
    message: 'Login Successful!',
    token: fastify.jwt.sign(jwtPayload)
  }
}