require('dotenv').config();
const path = require('path');
const express = require('express');
const projectsRouter = require('./routes/projects');
const communityReportsRouter = require('./routes/communityReports');
const authRouter = require('./routes/auth');
const inspectionsRouter = require('./routes/inspections');
const { ensureAdminSeeded } = require('./bootstrapAdmin');

const app = express();
app.use(express.json());

// Phase 4: GET /api/projects is public read-only data (no auth, no
// cookies), and the whole point is that other sites can read it — the
// "Ghana Big Push Watch" public tracker calls it from a different origin
// (GitHub Pages). Allow cross-origin GET there without opening up the
// authenticated routes.
app.use('/api/projects', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/projects', projectsRouter);
app.use('/api/community-reports', communityReportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/inspections', inspectionsRouter);

// Phase 3: the field-officer/admin dashboard is a static site (plain
// HTML/CSS/JS, no build step) that calls the API above with a JWT. Served
// from here so one deployment covers the API and the dashboard together.
app.use('/dashboard', express.static(path.join(__dirname, '..', 'dashboard')));

const port = process.env.PORT || 3000;
ensureAdminSeeded()
  .catch((err) => console.error('Admin bootstrap check failed:', err))
  .finally(() => {
    app.listen(port, () => {
      console.log(`Bigpush accountability API listening on port ${port}`);
    });
  });
