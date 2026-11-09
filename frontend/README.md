# RecipeAI Frontend

Next.js (App Router) + Tailwind CSS client for RecipeAI. Users add ingredients, get AI recipe suggestions, and save, favorite, and rate recipes. It talks to the Nest.js API in `../backend`.

## Tech stack

- **Next.js 16** (App Router, Turbopack) and **React 19**
- **Tailwind CSS 4**
- **TypeScript**
- No UI or state libraries: plain `fetch` and React context

## Folder structure

```
frontend/src/
├─ app/
│  ├─ layout.tsx               root layout: Navbar + AuthProvider
│  ├─ page.tsx                 /                 static landing page
│  ├─ login/page.tsx           /login            static
│  ├─ register/page.tsx        /register         static
│  ├─ generate/page.tsx        /generate         static shell, interactive
│  └─ recipes/
│     ├─ page.tsx              /recipes          static shell, interactive
│     └─ [id]/page.tsx         /recipes/:id      dynamic route
├─ components/
│  ├─ Navbar.tsx
│  ├─ AuthForm.tsx             shared by login and register
│  ├─ RecipeCard.tsx           works for unsaved drafts and saved recipes
│  ├─ RecipeDetail.tsx         client component for the dynamic page
│  └─ StarRating.tsx
└─ lib/
   ├─ api.ts                   the only file that calls the backend
   └─ AuthProvider.tsx         auth context, useAuth, useRequireAuth
```

## Prerequisites

- Node.js 20 or newer
- The backend running (default `http://localhost:4000`)

## Setup

### 1. Create the project and add the code

If you are starting from a fresh app:

```bash
npx create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Copy this repo's `src/` folder over the generated one (it replaces `layout.tsx` and `page.tsx`). Keep your generated `globals.css`, which already includes Tailwind.

If you cloned this repo instead, run `npm install`.

### 2. Configure the backend URL

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:4000` |

`NEXT_PUBLIC_` variables are embedded in the browser bundle at **build time** and are visible to everyone. Never put secrets in them. Rebuild after changing the value.

### 3. Run

```bash
npm run dev       # http://localhost:3000
npm run build     # production build
npm start         # serve the production build
npm run lint
```

The backend's `FRONTEND_URL` must exactly match this app's origin (`http://localhost:3000`), or the browser will block requests with a CORS error.

## Routing

Folders are URLs, and `page.tsx` makes a folder reachable.

| File | URL | Kind |
|---|---|---|
| `app/page.tsx` | `/` | Static (server component, prerendered) |
| `app/login/page.tsx` | `/login` | Static |
| `app/register/page.tsx` | `/register` | Static |
| `app/generate/page.tsx` | `/generate` | Static shell, client interactivity |
| `app/recipes/page.tsx` | `/recipes` | Static shell, client interactivity |
| `app/recipes/[id]/page.tsx` | `/recipes/anything` | Dynamic: `[id]` is a variable |

`npm run build` prints these with `○` (static) and `◐` (dynamic parts streamed in).

**Dynamic route:** `recipes/[id]/page.tsx` awaits `params` inside `<Suspense>` (required with Cache Components, which `create-next-app` enables by default) and hands the `id` to the `RecipeDetail` client component. That component needs the logged-in user's token from `localStorage`, so it must run in the browser.

**Server vs client components:** files are server components by default. Anything using `useState`, `useEffect`, clicks, or `localStorage` starts with `'use client'`.

Other routing features worth learning: catch-all `[...slug]`, route groups `(auth)`, `generateStaticParams`, and middleware/proxy for redirects.

## How it talks to the backend

- `lib/api.ts` is the single API client. It reads `NEXT_PUBLIC_API_URL`, adds `Authorization: Bearer <token>` to each request, and turns backend error responses (including Nest's validation messages) into readable `Error`s.
- `lib/AuthProvider.tsx` stores the user in React context. On load it checks `localStorage` for a token and calls `/auth/me`. `useAuth()` gives pages `user`, `login`, `register`, and `logout`.
- `useRequireAuth()` redirects logged-out visitors to `/login`. This is **convenience only**: the real protection is the JWT guard on the backend.

## Pages

| Page | What it does |
|---|---|
| `/generate` | Add ingredient chips, **Get recipes**, or **🎲 Surprise me**. Save any draft |
| `/recipes` | Your saved recipes, All / ❤ Favorites tabs, favorite toggle, delete |
| `/recipes/[id]` | Full recipe with image, ingredients, steps, ★ rating, favorite, delete |
| `/login`, `/register` | Email and password forms |

### Surprise me

No backend changes: it reuses the same endpoint as the normal button.

```tsx
const POOL = ['chicken', 'rice', 'tomato', 'egg', 'spinach', 'potato', 'onion', 'garlic', 'cheese', 'mushroom', 'pasta', 'beans', 'carrot', 'lemon'];

function surprise() {
  const picks = [...POOL].sort(() => Math.random() - 0.5).slice(0, 4);
  setIngredients(picks);
  generate(picks);   // same API call as "Get recipes"
}
```

`generate()` takes the list as a parameter instead of reading state, so any caller can reuse it.

## Security notes

- React escapes all rendered text, and the app never uses `dangerouslySetInnerHTML`, so AI-generated text cannot inject HTML or scripts.
- The JWT is kept in `localStorage` and sent as a Bearer header. This is simple and not exposed to classic CSRF, but any XSS bug could read it. For sensitive production apps, consider an `httpOnly` cookie (which then needs CSRF protection).
- Only fields the backend accepts are sent when saving a recipe. Image URLs are built by the server, not the client.
- Recipe images are loaded from an external generator (Pollinations) using plain `<img>` tags.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| CORS error in the browser console | Backend `FRONTEND_URL` does not match `http://localhost:3000` exactly |
| Every request fails with a network error | Backend is not running, or `NEXT_PUBLIC_API_URL` is wrong (restart `npm run dev` after editing `.env.local`) |
| Generate shows an error | Backend returned `502`: check the AI key and model in the backend console. `400` means an ingredient contains disallowed characters |
| Redirected to `/login` on every page | Token expired or invalid; log in again |
| `429` errors | Rate limit hit; wait a minute |
| Images do not load | The image service may be slow or down; the recipe still works |

## Deployment

Vercel is the simplest host for Next.js:

1. Push the repo to GitHub and import it into Vercel
2. Set the root directory to `frontend`
3. Add `NEXT_PUBLIC_API_URL` pointing to your deployed backend URL
4. Deploy, then set the backend's `FRONTEND_URL` to the Vercel URL

Alternatives: AWS Amplify Hosting, or a Node container on ECS Fargate or Cloud Run (`npm run build` then `npm start`).

## Testing status

TypeScript, ESLint, and `next build` pass on Next.js 16.4, React 19, and Tailwind 4. The UI has not been clicked through in a browser yet, so expect small styling tweaks.
