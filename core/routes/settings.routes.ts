import { FastifyInstance } from "fastify";
import { authenticate } from "../hooks/auth.hooks.js";
import { changeEmail, changePassword, getEmailAndPlan } from "../services/settings.service.js";
import { deleteUser } from "../services/users.service.js";



export async function settingsRoutes(fastify: FastifyInstance){
  fastify.get('/', {
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute'
      }
    }
  }, async (req, res) => {
    const result = await getEmailAndPlan(fastify, req.user.sub!);

    return res.code(200).send(result);
  });

  fastify.patch('/email-change', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '30 minutes'
      }
    },
    preHandler: authenticate
  }, async (req, res) => {
    const { email } = req.body as { email: string };

    await changeEmail(fastify, req.user.sub!, email);

    return res.code(200).send({ message: 'Email updated successfully' });
  });

  fastify.patch('/password-change', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '30 minutes'
      }
    },
    preHandler: authenticate
  }, async (req, res) => {
    const userPass = req.body as { currentPassword: string, newPassword: string };

    await changePassword(fastify, req.user.sub! ,userPass);

    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      path: '/'
    });

    return res.code(200).send({ message: 'Password successfully changed!' });
  });

  fastify.delete('/delete', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '30 minutes'
      }
    },
    preHandler: authenticate
  }, async (req, res) => {
    await deleteUser(fastify, req.user.sub!);
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      path: '/'
    });

    return res.code(200).send({ message: 'Account deleted successfully!' });
  })
}