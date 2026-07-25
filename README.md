# matchingg backend

the backend for matchingg — an AI powered CV to job compatibility scorer. built with Fastify and deployed on DigitalOcean.

## what it does

handles CV extraction (PDF DOCX and image via OCR) then sends the content to Claude AI to generate a compatibility score against the job description. also handles auth email verification password reset and user history.

## tech stack

- Fastify
- TypeScript
- TypeORM + PostgreSQL
- Redis (caching check results)
- Claude AI (Anthropic SDK)
- Resend (transactional emails)
- deployed on DigitalOcean

## getting started

clone the repo then install dependencies

```bash
npm install
```

copy the example env file and fill in your values

```bash
cp .env.example .env
```

required env vars

```
DB_CONNECTION      postgres connection string
JWT_SECRET         any random secret string
ANTHROPIC_API_KEY  your Anthropic API key
RESEND_API_KEY     your Resend API key
MATCHINGG_EMAIL    the from address for emails
FRONTEND_URL       http://localhost:4200 for local dev
```

run in dev mode

```bash
npm run dev
```

server starts at http://localhost:3002

## production

```bash
npm start
```

this sets `NODE_ENV=production` and uses whatever env vars are configured on the server

## project structure

```
core/
├── dto/           request validation
├── entities/      TypeORM entities (User Results)
├── errors/        error handler
├── hooks/         Fastify hooks (auth guard etc)
├── routes/        route definitions
└── services/      business logic (auth checks history resend settings)
plugins/
├── database.ts    TypeORM + Fastify plugin
└── multipart.ts   file upload handling
server.ts          entry point
```

## note on AI tools

Claude was used as a coding assistant during development. same way you'd use a senior dev to bounce ideas off or help debug. the architecture decisions API design database schema and overall structure are mine. AI helped with boilerplate and speeding things up not replacing the thinking.

## related

- frontend: [matchingg-frontend](https://github.com/kenzietann/matchingg-frontend)
- live site: https://www.matchingg.com