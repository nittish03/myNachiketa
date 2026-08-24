# Hotel Staff Frontend (Nachiketa)

Next.js frontend for hotel staff management: create, read, update, and delete staff records against the Nachiketa backend API. Includes search and filtering for day-to-day hotel operations.

## API base URL

Production / test backend:

`https://testaug.onrender.com`

Configure the client via `NEXT_PUBLIC_BACKEND_URL` (no trailing path such as `/health`).

## Features

- **CRUD** — Add, view, edit, and remove hotel staff records
- **Search** — Find staff by name or other fields exposed by the API
- **Filter** — Narrow lists (e.g. role, department) as supported by the backend

The app may also use NextAuth (credentials) and Prisma for admin auth and local database setup; see env table below for full local development.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For auth and database workflows:

```bash
npm run dbgenerate
npm run dbpush   # when schema changes
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | yes (frontend API) | Backend API origin, e.g. `https://testaug.onrender.com` |
| `DATABASE_URL` | yes (local auth) | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | yes (local auth) | Secret for NextAuth sessions |
| `FRONTEND_BASE_URL` | yes (local auth) | App URL (e.g. `http://localhost:3000`); sets `NEXTAUTH_URL` |
| `BACKEND_BASE_URL` | optional | Server-side backend URL (same origin as above, without `/health`) |
| `NEXTAUTH_DEBUG` | no | Set `true` to enable NextAuth debug logs |

Copy `.env` locally and **never commit** `.env` or secrets.

## Deployment (Vercel)

1. Install the Vercel CLI (`npm i -g vercel`) or connect the GitHub repo in the [Vercel dashboard](https://vercel.com).
2. **Import** the repository (`origin` is typically GitHub).
3. Framework preset: **Next.js** (default). No `vercel.json` is required for a standard App Router build.
4. **Environment variables** in Vercel → Project → Settings → Environment Variables:
   - `NEXT_PUBLIC_BACKEND_URL` = `https://testaug.onrender.com`
   - Add `DATABASE_URL`, `NEXTAUTH_SECRET`, `FRONTEND_BASE_URL` (production URL), and any other vars your auth layer needs for production.
5. Build command: `npm run build` (default). Output: Next.js default.
6. After deploy, set `FRONTEND_BASE_URL` / `NEXTAUTH_URL` to your Vercel URL if using NextAuth in production.

Redeploy after changing environment variables so `NEXT_PUBLIC_*` values are baked into the client bundle.

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production
- `npm run dbgenerate` — Prisma client generate
- `npm run dbpush` — Prisma `db push`

Auth uses existing `ADMIN` users in the database (credentials provider; no public signup).
