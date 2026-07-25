const required = [
  'DB_CONNECTION',
  'JWT_SECRET',
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'MATCHINGG_EMAIL',
  'FRONTEND_URL',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`[env] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDev: (process.env.NODE_ENV ?? 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
  dbConnection: process.env.DB_CONNECTION!,
  jwtSecret: process.env.JWT_SECRET!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  resendApiKey: process.env.RESEND_API_KEY!,
  matchinggEmail: process.env.MATCHINGG_EMAIL!,
  contactEmail: process.env.CONTACT_EMAIL ?? 'tandera.kenzie@gmail.com',
  frontendUrl: process.env.FRONTEND_URL!,
  port: Number(process.env.PORT ?? 3002),
};
