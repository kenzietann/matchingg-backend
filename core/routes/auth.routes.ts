import { FastifyInstance } from "fastify";
import { AuthDto } from "../dto/auth.dto.js";
import { forgotPassword, loginUser, resetPassword, signup, verifyEmail } from "../services/auth.service.js";
import { authenticate } from "../hooks/auth.hooks.js";

export default async function authRoutes(fastify: FastifyInstance){
  fastify.post('/signup', { config: {
    rateLimit: {
      max: 3,
      timeWindow: '30 minutes'
    }
  } }, async (req, res) => {
    const userData = req.body as AuthDto;
    await signup(fastify, userData);
    return res.code(201).send('Email Verification link has been sent! Please check your email');
  });

  fastify.get('/verify-email', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '15 minutes'
      }
    }
  }, async (req, res) => {
    const { token } = req.query as { token: string };
    await verifyEmail(fastify, token);
    return res.code(200).send({ message: 'Email verified successfully' });
  });


  fastify.post('/login', { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } }, async(req, res) => {
    const userData = req.body as AuthDto;
    const token = await loginUser(fastify, userData);

    res.cookie('token', token.token, {
      httpOnly: true,
      secure: true, 
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return res.code(200).send({ message: token.message });
  });

  fastify.get('/me', {
     preHandler: authenticate,
     config: {
      rateLimit: {
        max: 20,
        timeWindow: '1 minute'
      }
     }
    }, async(req, res) => {
      const plan = req.user.plan ?? 'free';
      const features = {
        free: {
          checks: 3,
          atsScoring: false,
          strengthgaps: false,
          airecommendation: false,
          saveresult: false,
          exporttofile: false
        },
        paid: {
          checks: -1,
          atsScoring: true,
          strengthgaps: true,
          airecommendation: true,
          saveresult: true,
          exporttofile: true
        }
      }[plan];

      return res.code(200).send({ 
        sub: req.user.sub,
        plan,
        features
      });
  });

  fastify.post('/logout', async(req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      path: '/',
    });
    return res.code(200).send({ message: "Logged out successfully" });
  });

  fastify.post('/forgot-password', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '30 minutes'
      }
    }
  }, async(req, res) => {
    const { email } = req.body as { email: string };

    await forgotPassword(fastify, email);

    return res.code(200).send({ message: 'If an account exists for that email, a password reset link has been sent.' });
  });

  fastify.post('/reset-password', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '30 minutes'
      }
    }
  }, async(req, res) => {
    const { token, newPassword } = req.body as { token: string; newPassword: string };

    await resetPassword(fastify, token, newPassword);

    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      path: '/',
    });

    return res.code(200).send({ message: 'Password reset successfully' });
  });
}