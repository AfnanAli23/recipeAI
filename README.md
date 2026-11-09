# 🍳 RecipeAI

An AI-powered recipe generator and manager. Tell it which ingredients you have at home, get AI-generated recipe suggestions with generated images, then save, favorite, and rate the ones you like.

Built as a full-stack learning project covering Next.js routing, a Nest.js REST API, TypeORM with PostgreSQL, JWT authentication, AI integration, and common web security practices.

## Features

- **Ingredient-based recipes**: add what you have, get 3 AI-generated recipe ideas
- **🎲 Surprise me**: one click generates recipes from random ingredients (frontend only, reuses the same endpoint)
- **Auth**: register and log in with email and password (JWT, bcrypt)
- **Save recipes** to your own collection
- **Favorites** with a favorites-only filter
- **Ratings**: 1–5 stars per recipe
- **AI-generated images** for every recipe
- **Security hardening**: parameterized queries, input validation, rate limiting, secure headers, per-user data isolation

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Nest.js, TypeORM |
| Database | PostgreSQL (local by default, online supported) |
| AI | Any OpenAI-compatible API: Groq (default), Gemini, or OpenAI |
| Images | Pollinations (free, no key) |

## Architecture

```
Browser (Next.js :3000)
   │  fetch() + Authorization: Bearer <JWT>
   ▼
Nest.js API (:4000)  ──►  PostgreSQL (:5432)   users, recipes
   │
   ├──►  AI provider        → recipe text (JSON)
   └──►  Pollinations       → recipe image (URL)
```

## Project structure

```
recipe-ai/
├─ backend/src/
│  ├─ main.ts            helmet, CORS, global validation
│  ├─ app.module.ts      config, DB connection, rate limiting
│  ├─ users/             User entity and service
│  ├─ auth/              register, login, JWT guard
│  ├─ recipes/           Recipe entity, DTOs, service, controller
│  └─ ai/                AI provider client, image URL builder
└─ frontend/src/
   ├─ app/
   │  ├─ page.tsx               /                 static
   │  ├─ login/ register/       /login /register  static
   │  ├─ generate/              /generate         static, interactive
   │  └─ recipes/
   │     ├─ page.tsx            /recipes          static, interactive
   │     └─ [id]/page.tsx       /recipes/:id      dynamic
   ├─ components/        Navbar, AuthForm, RecipeCard, RecipeDetail, StarRating
   └─ lib/               api.ts (backend client), AuthProvider.tsx
```

## Prerequisites

- Node.js 20 or newer
- PostgreSQL 14 or newer, installed and running locally
- An API key from an AI provider (see below)

## Getting started

### 1. Create the database

```bash
psql -U postgres -h localhost
```

```sql
CREATE DATABASE recipe_app;
```

Tables are created automatically by TypeORM on first start (development only).

### 2. Get an AI API key

**Groq (default, free tier):**

1. Sign up at [console.groq.com](https://console.groq.com)
2. Open **API Keys** → **Create API Key** → copy it (shown only once)

Gemini ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)) and OpenAI ([platform.openai.com](https://platform.openai.com)) also work. Only three environment variables change.

### 3. Run the backend

```bash
cd backend
npm install
cp .env.example .env     # then fill in the values
npm run start:dev
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The API starts on `http://localhost:4000`.

### 4. Run the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

> Full step-by-step setup, including how this project was scaffolded, is in [GUIDE.md](./GUIDE.md).

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | API port (default `4000`) |
| `NODE_ENV` | `development` or `production` (production disables `synchronize`) |
| `FRONTEND_URL` | Allowed CORS origin, e.g. `http://localhost:3000` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Local PostgreSQL connection |
| `DATABASE_URL` | Optional. If set, used instead of the `DB_*` values (online databases such as Neon, Supabase, RDS) |
| `JWT_SECRET` | Long random string used to sign tokens (required) |
| `AI_API_KEY` | AI provider key |
| `AI_BASE_URL` | e.g. `https://api.groq.com/openai/v1` |
| `AI_MODEL` | Model id (model names change; check your provider's docs) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL, e.g. `http://localhost:4000`. Visible in the browser, so never put secrets here |

## API reference

All `/recipes` routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account, returns a JWT |
| POST | `/auth/login` | Log in, returns a JWT |
| GET | `/auth/me` | Current user |
| POST | `/recipes/generate` | `{ ingredients: string[] }` → 3 AI draft recipes (not saved) |
| POST | `/recipes` | Save a draft to your collection |
| GET | `/recipes` | List your recipes (`?favorite=true` for favorites only) |
| GET | `/recipes/:id` | Get one recipe |
| PATCH | `/recipes/:id/favorite` | Toggle favorite |
| PATCH | `/recipes/:id/rating` | `{ rating: 1-5 }` |
| DELETE | `/recipes/:id` | Delete a recipe |

## Security

| Threat | Mitigation |
|---|---|
| SQL injection | TypeORM parameterized queries; UUID-validated route params; validated emails |
| Mass assignment | `ValidationPipe` with `whitelist` and `forbidNonWhitelisted`; `userId` always taken from the token |
| Broken access control | Every query filters by `userId`; other users' recipes return 404 |
| Password storage | bcrypt (12 rounds); hash hidden from queries by default |
| Brute force and AI cost abuse | Global rate limit, stricter limits on login and AI generation |
| XSS | React output escaping; no `dangerouslySetInnerHTML`; Helmet headers |
| Prompt injection | Strict ingredient character and length limits; system prompt treats input as data; AI output re-validated and trimmed |
| Cross-origin abuse | CORS restricted to `FRONTEND_URL` |
| Secret leakage | Secrets live in git-ignored `.env`; AI key never reaches the browser |

The one rule behind SQL injection safety: never build SQL with string concatenation. Use placeholders (`:name` or `$1`).

## Testing status

- Backend: 30 end-to-end checks passed against a real local PostgreSQL 16 (auth, CRUD, favorites, ratings, access control, injection attempts, rate limiting), using a mock AI server.
- Frontend: TypeScript, ESLint, and `next build` pass.
- Not yet verified: calls to a live AI provider, and the Pollinations image service, which is community-run and may be slow or unavailable at times.

## Deployment and scaling

Deployment is covered in [GUIDE.md](./GUIDE.md#8-step-7-deploy-and-scale-teaching-only-nothing-is-deployed). Short version:

- **Simple start**: Vercel (frontend) + Railway or Render (backend) + Neon or Supabase (PostgreSQL)
- **Scalable path**: AWS with ECS Fargate or App Runner, RDS PostgreSQL, and CloudFront
- Before production: disable `synchronize` and use TypeORM migrations, use HTTPS, and keep secrets in the platform's environment settings

## Roadmap ideas

- Pagination and search on saved recipes
- TypeORM migrations
- Jest unit tests and Supertest e2e tests
- Swagger API docs
- Dietary filters passed into the AI prompt
- Image storage on S3 with a CDN
- Redis caching for AI results and distributed rate limiting
- Docker Compose for one-command local setup

## License

MIT. Add a `LICENSE` file if you publish this repository.
