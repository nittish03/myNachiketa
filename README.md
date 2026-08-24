# Nachiketa

Next.js app with NextAuth (credentials) and Prisma.

## Setup

```bash
npm install
npm run dbgenerate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Env

Copy `.env` and set:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | yes | Secret for NextAuth sessions |
| `FRONTEND_BASE_URL` | yes | App URL (e.g. `http://localhost:3000`); sets `NEXTAUTH_URL` |
| `NEXTAUTH_DEBUG` | no | Set `true` to enable NextAuth debug logs |

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production
- `npm run dbgenerate` — `prisma generate`
- `npm run dbpush` — `prisma db push`

Auth uses existing `ADMIN` users in the database (credentials provider; no public signup).
