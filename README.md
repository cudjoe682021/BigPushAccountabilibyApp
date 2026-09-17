# Ghana Road Accountability Platform

Shared backend for three interfaces: a government/field officer dashboard, a
community reporting app, and a public transparency site. Full plan and data
model: see the project doc.

This repo currently holds **Phase 1 (data foundation)**: the Prisma schema
for all five entities, and a seed script that loads the existing 107-contract
procurement dataset (Ghana Big Push Watch, RTI-sourced via The Fourth Estate)
into Contractor and Project tables.

## Setup

```bash
npm install
cp .env.example .env   # fill in your real DATABASE_URL
npm run prisma:migrate # creates the tables
```

## Load the procurement data

Put your export at `data/procurement.csv` (columns documented in
`data/README.md`), then:

```bash
npm run seed
```

## Run the API

```bash
npm run dev
```

- `GET /api/projects` - list projects (filter with `?region=` or `?status=`)
- `GET /api/projects/:id` - one project, with its verified inspections and
community reports kept as separate arrays (never merged into one status)

## Where this connects to your existing apps

- **BigPush Watchdog** (React Native/Expo): point its API base URL at this
server once deployed, and extend its existing report screens to POST into
`CommunityReport` instead of wherever they write today. This is Phase 2.
- **Ghana Big Push Watch** (the HTML dashboard): swap its static procurement
data for calls to `GET /api/projects`. This is Phase 4.

## Next phases

3. Official dashboard (auth + inspection logging + report review) - not yet
started.
5. Alert job on report thresholds - not yet started, needs Phase 2 report
volume to tune against.
