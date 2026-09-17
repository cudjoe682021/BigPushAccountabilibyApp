# Ghana Road Accountability Platform

Shared backend for three interfaces: a government/field officer dashboard, a
community reporting app, and a public transparency site. Full plan and data
model: see the project doc.

This repo currently holds **Phase 1 (data foundation)** and **Phase 2
(community reporting app)**.

## Phase 1: backend and data

Prisma schema for all five entities, a seed script that loads the existing
107-contract procurement dataset (Ghana Big Push Watch, RTI-sourced via The
Fourth Estate), and an Express API.

### Setup

```bash
npm install
cp .env.example .env   # fill in your real DATABASE_URL
npm run prisma:migrate # creates the tables
```

### Load the procurement data

Put your export at `data/procurement.csv` (columns documented in
`data/README.md`), then:

```bash
npm run seed
```

### Run the API

```bash
npm run dev
```

- `GET /api/projects` - list projects (filter with `?region=` or `?status=`)
- `GET /api/projects/:id` - one project, with its verified inspections and community reports kept as separate arrays (never merged into one status)
- `POST /api/community-reports` - submit a report (project, category, latitude, longitude, optional name/phone/media)
- `GET /api/community-reports/grouped?projectId=` - reports on a project grouped by category within a rolling 30-day window

## Phase 2: community reporting app (`mobile/`)

  A fresh Expo/React Native app - no existing BigPush Watchdog repo was found, so this was built new against the Phase 1/2 API rather than extending existing code. Screens: Splash, Home Dashboard, Project Detail, Report a Problem, Confirmation, Notifications. See `mobile/README.md` for setup and what's still stubbed (photo/video upload, push notifications).

## Where this connects to the rest

  - **Ghana Big Push Watch** (the HTML dashboard): swap its static procurement data for calls to `GET /api/projects`. This is Phase 4.

## Next phases

- **Phase 3:** official dashboard (auth + inspection logging + report review) - not yet started.
- **Phase 5:** alert job on report thresholds - not yet started, needs real report volume from Phase 2 to tune against.
