require('dotenv').config();
const path = require('path');
const express = require('express');
const projectsRouter = require('./routes/projects');
const communityReportsRouter = require('./routes/communityReports');
const authRouter = require('./routes/auth');
const inspectionsRouter = require('./routes/inspections');

const app = express();
app.use(express.json());

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
app.listen(port, () => {
  console.log(`Bigpush accountability API listening on port ${port}`);
});
