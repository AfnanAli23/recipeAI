# RecipeAI Backend

Nest.js REST API for RecipeAI: authentication, AI recipe generation, and recipe management, stored in PostgreSQL through TypeORM.

## Tech stack

- **Nest.js 11** (CommonJS scaffold)
- **TypeORM** + **PostgreSQL** (`pg` driver)
- **JWT** auth (`@nestjs/jwt`) with **bcryptjs** password hashing
- **class-validator / class-transformer** for request validation
- **Helmet** (secure headers) and **@nestjs/throttler** (rate limiting)
- Any **OpenAI-compatible AI API** (Groq by default), called with plain `fetch`

## Folder structure

```
backend/src/
├─ main.ts                 helmet, CORS, global ValidationPipe
├─ app.module.ts           config, TypeORM connection, global rate limiting
├─ users/
│  ├─ user.entity.ts       users table (passwordHash hidden by default)
│  ├─ users.service.ts
│  └─ users.module.ts
├─ auth/
│  ├─ auth.dto.ts          RegisterDto, LoginDto
│  ├─ auth.service.ts      register, login, token issuing
│  ├─ auth.controller.ts   /auth/register, /auth/login, /auth/me
│  ├─ jwt-auth.guard.ts    JwtAuthGuard and @UserId() decorator
│  └─ auth.module.ts
├─ ai/
│  ├─ ai.service.ts        AI request, output validation, image URL builder
│  └─ ai.module.ts
└─ recipes/
   ├─ recipe.entity.ts     recipes table
   ├─ recipes.dto.ts       GenerateRecipesDto, SaveRecipeDto, RateRecipeDto
   ├─ recipes.service.ts
   ├─ recipes.controller.ts
   └─ recipes.module.ts
```

## Prerequisites

- Node.js 20 or newer
- PostgreSQL running locally (or an online connection string)
- An AI provider API key

## Setup

### 1. Create the database

```bash
psql -U postgres -h localhost
```

```sql
CREATE DATABASE recipe_app;
```

TypeORM creates the `users` and `recipes` tables automatically on first start when `NODE_ENV` is not `production`.

### 2. Create the project and install dependencies

If you are starting from a fresh Nest scaffold:

```bash
npx @nestjs/cli@11 new backend --package-manager npm --skip-git --strict
cd backend
npm install @nestjs/config @nestjs/typeorm typeorm pg @nestjs/jwt @nestjs/throttler bcryptjs helmet class-validator class-transformer
```

Then delete the scaffold's `src/app.controller.ts`, `src/app.controller.spec.ts`, `src/app.service.ts` and `test/app.e2e-spec.ts`, and copy this repo's `src/` folder over yours.

If you cloned this repo instead, just run `npm install`.

> Use `@nestjs/cli@11`. The newest CLI generates an ES-module project that needs `.js` import endings and does not match this code.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Run

```bash
npm run start:dev      # development, with watch
npm run build && node dist/main   # production build
```

The API listens on `http://localhost:4000`.

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | API port (default `4000`) |
| `NODE_ENV` | `development` or `production`. Production turns off TypeORM `synchronize` |
| `FRONTEND_URL` | Only origin allowed by CORS, e.g. `http://localhost:3000` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Local PostgreSQL connection |
| `DATABASE_URL` | Optional. When set, it replaces the `DB_*` values and SSL is enabled (Neon, Supabase, Railway, RDS) |
| `JWT_SECRET` | Required. The app refuses to start without it |
| `AI_API_KEY` | AI provider key |
| `AI_BASE_URL` | Provider base URL, e.g. `https://api.groq.com/openai/v1` |
| `AI_MODEL` | Model id. Model names change, so check your provider's docs if you get `model_not_found` |

### Getting an AI key

**Groq (default, free tier):** sign up at [console.groq.com](https://console.groq.com), open **API Keys**, click **Create API Key**, and copy it (shown once).

**Gemini:** key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey), `AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai`.

**OpenAI:** key from [platform.openai.com](https://platform.openai.com) (billing required), `AI_BASE_URL=https://api.openai.com/v1`.

Quick key test (Groq):

```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"Say hi"}]}'
```

### Using an online PostgreSQL

Set `DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require` in `.env`. No code change is needed.

## API reference

All `/recipes` routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/auth/register` | `{ email, password }` | Create account, returns `{ accessToken, user }` |
| POST | `/auth/login` | `{ email, password }` | Log in, returns `{ accessToken, user }` |
| GET | `/auth/me` | none | Current user |
| POST | `/recipes/generate` | `{ ingredients: string[] }` | 3 AI draft recipes, not saved |
| POST | `/recipes` | `{ title, description, ingredients, steps, cookTimeMinutes }` | Save a recipe |
| GET | `/recipes` | none | List your recipes. `?favorite=true` for favorites only |
| GET | `/recipes/:id` | none | One recipe (UUID) |
| PATCH | `/recipes/:id/favorite` | none | Toggle favorite |
| PATCH | `/recipes/:id/rating` | `{ rating: 1-5 }` | Rate a recipe |
| DELETE | `/recipes/:id` | none | Delete a recipe |

Validation rules worth knowing:

- Password: 8–72 characters
- Ingredients: 1–15 items, each 2–40 characters, letters/numbers/spaces/`-`/`'` only
- Unknown body fields are rejected with `400` (so clients cannot send `userId` or `imageUrl`)

### Quick test with curl

```bash
# Register (copy accessToken from the response)
curl -X POST localhost:4000/auth/register -H "Content-Type: application/json" \
  -d '{"email":"me@test.com","password":"password123"}'

# Generate recipes
curl -X POST localhost:4000/recipes/generate \
  -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" \
  -d '{"ingredients":["chicken","rice","tomato"]}'
```

## Data model

**users**: `id` (uuid), `email` (unique), `passwordHash` (not selected by default), `createdAt`

**recipes**: `id` (uuid), `title`, `description`, `ingredients` (jsonb), `steps` (jsonb), `cookTimeMinutes`, `imageUrl`, `isFavorite`, `rating` (nullable), `userId` (indexed, FK to users, cascade delete), `createdAt`

Favorites and ratings live on the recipe row because each recipe belongs to a single user. If you later share recipes between users, move them into separate `favorites` and `ratings` tables.

## Security

| Threat | Mitigation |
|---|---|
| SQL injection | TypeORM parameterized queries, `ParseUUIDPipe` on ids, validated emails |
| Mass assignment | `ValidationPipe` with `whitelist` and `forbidNonWhitelisted`; `userId` comes from the JWT |
| Broken access control | Every recipe query includes `userId`; other users' recipes return 404 |
| Password storage | bcrypt, 12 rounds; same error for unknown email and wrong password |
| Brute force and AI cost abuse | 60 req/min global, 10/min on login, register and AI generation |
| Prompt injection | Strict ingredient character and length limits; user text sent as data; AI output re-parsed and trimmed |
| Cross-origin abuse | CORS limited to `FRONTEND_URL` |
| Secret leakage | `.env` is git-ignored; AI key stays on the server |
| Information leaks | Provider errors are logged server-side, clients get a generic message |

Never build SQL with template strings or `+`. If you use `query()` or the query builder, use placeholders (`:name` or `$1`).

## Image generation

`AiService.imageUrlFor(title)` builds a [Pollinations](https://pollinations.ai) URL on the server from the recipe title. The browser loads it directly, so no key or image storage is needed. Pollinations is community-run and can be slow or unavailable. For production, generate once, store in S3 or Cloudinary, and save that URL.

## Production notes

- Set `NODE_ENV=production`; this disables `synchronize`, so create TypeORM **migrations** first
- Use HTTPS and store secrets in your platform's environment settings
- `@nestjs/throttler` counts in memory per instance; use a Redis storage adapter when running several instances
- Add pagination to `GET /recipes` before large datasets
- Run `npm audit` regularly

Example `Dockerfile` (not built in this project; test locally with `docker build`):

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/main"]
```

## Testing status

30 end-to-end checks passed against a real local PostgreSQL 16 with a mock AI server: auth, CRUD, favorites, ratings, access control, injection attempts, extra-field rejection, Helmet headers, and rate limiting. Calls to a live AI provider have not been verified yet.
