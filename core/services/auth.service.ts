import { FastifyInstance } from "fastify";
import { AuthDto, EmailChangeDto, GoogleTokenPayload } from "../dto/auth.dto.js";
import { UserEntity } from "../entities/user.entity.js";
import { AppError } from "../errors/error.handler.js";
import bcrypt from 'bcrypt';
import { sendVerificationEmail, sendPasswordResetEmail } from "./resend.service.js";
import { createGoogleUser, createVerifiedUser, updateUserEmail } from "./users.service.js";
import axios from 'axios';
import { env } from "../env.js";

export async function signup(fastify: FastifyInstance, userData: AuthDto){
  const userRepository = fastify.orm.getRepository(UserEntity);
  const existingEmail = await userRepository.findOne({ where: { email: userData.email } });

  if(existingEmail) throw new AppError('Email already taken', 409, 'email_taken');

  if(!userData.password) throw new AppError('Password is required', 400, 'password_required');
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
  
  const magicLink = `${env.frontendUrl}/auth/verify-email?token=${token}`;
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

  if (!userByEmail.password) {
    throw new AppError('This account uses Google Sign-In. Please log in with Google.', 400, 'google_account');
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

export async function forgotPassword(fastify: FastifyInstance, email: string){
  const userRepository = fastify.orm.getRepository(UserEntity);
  const user = await userRepository.findOne({ where: { email } });

  if(!user) return;

  const token = fastify.jwt.sign(
    { type: 'reset-password' },
    { expiresIn: '15m' }
  );

  await fastify.redis.set(`reset:${token}`, user.id, 'EX', 900);

  const magicLink = `${env.frontendUrl}/auth/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, magicLink);
}

export async function resetPassword(fastify: FastifyInstance, token: string, newPassword: string){
  let payload: any;

  try {
    payload = await fastify.jwt.verify(token);
  } catch {
    throw new AppError('Invalid or expired reset link', 401, 'invalid_token');
  }

  if(payload.type !== 'reset-password') throw new AppError('Invalid token type', 401, 'invalid_token_type');

  const userId = await fastify.redis.get(`reset:${token}`);
  if(!userId) throw new AppError('Reset link already used or expired', 401, 'link_used');

  await fastify.redis.del(`reset:${token}`);

  const userRepository = fastify.orm.getRepository(UserEntity);
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await userRepository.update({ id: userId }, { password: hashedPassword });
}

export async function googleAuth(fastify: FastifyInstance, token: string){
  const userRepository = fastify.orm.getRepository(UserEntity);
  const { data } = await axios.get<GoogleTokenPayload>(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

  if(data.email_verified !== 'true') throw new AppError('Email not verified by Google', 400, 'google_email_unverified');
  if(data.aud !== env.googleClientId) throw new AppError('Invalid token', 401, 'invalid_token');

  const userGoogleId = await userRepository.findOne({ where: { googleId: data.sub } });
  if(userGoogleId) {
    const jwtPayload = {
      sub: userGoogleId.id,
      plan: userGoogleId.plan,
      type: 'login'
    };
    return {
      message: 'Login Successful!',
      token: fastify.jwt.sign(jwtPayload)
    }
  }

  const userEmail = await userRepository.findOne({ where: { email: data.email } });
  if(userEmail) {
    await userRepository.update({ id: userEmail.id }, { googleId: data.sub });

    const jwtPayload = {
      sub: userEmail.id,
      plan: userEmail.plan,
      type: 'login'
    };

    return {
      message: 'Login Successful!',
      token: fastify.jwt.sign(jwtPayload)
    }
  } else {
    const userData = {
      email: data.email,
      googleId: data.sub
    }

    const createdUser = await createGoogleUser(fastify, userData);

    const jwtPayload = {
      sub: createdUser.id,
      plan: createdUser.plan,
      type: 'login'
    };

    return {
      message: 'Login Successful!',
      token: fastify.jwt.sign(jwtPayload)
    }
  }
}