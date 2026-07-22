import { FastifyInstance } from "fastify";
import { ContactDto } from "../dto/contact.dto.js";
import { sendContactMessage } from "../services/resend.service.js";
import { AppError } from "../errors/error.handler.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function contactRoutes(fastify: FastifyInstance){
  fastify.post<{ Body: ContactDto }>('/', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 hour'
      }
    }
  }, async (req, res) => {
    const { email, message } = req.body;

    if (!email || !EMAIL_REGEX.test(email)) {
      throw new AppError('Please enter a valid email address', 400, 'invalid_email');
    }

    if (!message || message.trim().length < 10) {
      throw new AppError('Message must be at least 10 characters long', 400, 'message_too_short');
    }

    if (message.length > 2000) {
      throw new AppError('Message is too long', 400, 'message_too_long');
    }

    await sendContactMessage(email, message.trim());

    return res.code(200).send({ message: 'Your message has been sent! We\'ll get back to you soon.' });
  });
}
