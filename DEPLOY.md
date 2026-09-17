# Deploying for free (Render + Neon)

Everything below is free with no card required to get started. Two accounts,
both sign in with GitHub:

- **Neon** (neon.tech) — Postgres. Free tier never expires (a database on
  Render's own free tier does — it's deleted after 44 days — so we use
  Neon for the database and Render only for the API).
- **Render** (render.com) — runs the Express API and the `/dashboard`
  static files it serves. Free web services spin down after 15 minutes of
  no traffic and take about a minute to wake back up on the next request.
  Fine for a low-traffic project; the first click after a quiet stretch
  will just feel slow.

## 1. Create the database (Neon)

1. Sign up at neon.tech with GitHub.
2. Create a project (any name and region are fine).
3. Copy the connection string it gives you — it looks like
   `postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require`.
   Keep this tab open, you'll paste it into Render next.

## 2. Deploy the API (Render)

1. Sign up at render.com with GitHub and grant it access to the
   `BigPushAccountabilibyApp` repo.
2. New → Blueprint → pick this repo. Render will read `render.yaml` from
   the repo root and propose one service, `bigpush-accountability-api`.
3. When it asks for the environment variables it can't fill in itself:
   - `DATABASE_URL` → the Neon connection string from step 1
   - `ADMIN_EMAIL` → the email you'll use to log into the dashboard
   - `ADMIN_PASSWORD` → a real password (you'll create the account with
     it in step 3 below — change it later if you want)
   - `ADMIN_NAME` → your name as it should show in the dashboard
   - `JWT_SECRET` is generated for you automatically, leave it alone
4. Click Apply. First deploy takes under a minute — it runs
   `npx prisma db push`, which creates all the tables in your new Neon
   database straight from `prisma/schema.prisma`.
5. Once it's live, Render shows you the service URL, something like
   `https://bigpush-accountability-api.onrender.com`.

Your admin login is created automatically the first time the server
starts — no shell needed (Render's free tier doesn't include one anyway).
On startup it checks whether any user exists yet; if not, it creates one
from `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`, bcrypt-hashed. It
only ever does this once — later restarts leave existing accounts alone,
so it's safe even if the service restarts on its own.

## 3. Try it

- Dashboard: `https://<your-service>.onrender.com/dashboard` — log in
  with the admin email/password from step 2.
- API: `https://<your-service>.onrender.com/api/projects` — will return
  `[]` until you seed real project data (see `data/README.md` for the
  CSV format `scripts/seed.js` expects).
- Ghana Big Push Watch: add `?api=https://<your-service>.onrender.com`
  to the live tracker's URL and roads that match a seeded project by
  name will show a field-verification badge.

## 4. Point the mobile app and the public tracker at it

- Mobile app: set `apiBaseUrl` in `mobile/app.json` to your Render URL.
- Public tracker: once you're happy with it, update the default in
  `ghana_roads_tracker.html` so `?api=` isn't required for every visitor
  (or leave it as an opt-in param — up to you).

## Costs to watch for

Both free tiers above are genuinely free indefinitely, not trials — but
two limits are worth knowing before you rely on this:

- Render free web services sleep after 15 minutes idle (slow first
  request after a quiet stretch, no other cost).
- Neon's free compute suspends after 5 minutes idle too (same effect —
  first query after idle time is a bit slower — but your data is never
  deleted for inactivity, unlike Render's free Postgres).

If this ever gets real traffic (e.g. you share it widely), the next step
up is Render's $7/mo Starter plan for the web service, still paired with
Neon (its paid tier starts around $19/mo, or stay on Neon free until you
outgrow the 0.5 GB storage / 100 compute-hours a month).
