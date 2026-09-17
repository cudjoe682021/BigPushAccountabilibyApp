const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const VALID_STATUSES = ['ON_SCHEDULE', 'DELAYED', 'WORK_STOPPED', 'NOT_RECENTLY_VERIFIED'];

// Every route here requires a logged-in field officer or admin.
router.use(requireAuth);

// GET /api/inspections?projectId=... — inspection history for a project,
// newest first. Used by the dashboard's project page; GET /api/projects/:id
// also returns this same list embedded, kept here as its own endpoint for
// re-fetching just the history after logging a new inspection.
router.get('/', async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) {
    return res.status(400).json({ error: 'projectId query param is required' });
  }

  const inspections = await prisma.inspection.findMany({
    where: { projectId },
    orderBy: { inspectionDate: 'desc' },
  });

  res.json(inspections);
});

// POST /api/inspections — a field officer logs a ground-truth inspection.
// officerId/officerName come from the authenticated token, never the request
// body, so an inspection can't be logged under someone else's name.
//
// projectStatus is optional: when the officer sets it, the project's status
// (shown on the public site and both apps) is updated in the same request,
// so logging an inspection is how ON_SCHEDULE / DELAYED / WORK_STOPPED
// actually changes. Community reports never do this on their own — the
// verified-vs-reported separation holds even here.
router.post('/', async (req, res) => {
  const { projectId, percentComplete, delays, notes, mediaUrls, projectStatus } = req.body;

  if (!projectId || percentComplete === undefined) {
    return res.status(400).json({ error: 'projectId and percentComplete are required' });
  }

  const percent = Number(percentComplete);
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
    return res.status(400).json({ error: 'percentComplete must be an integer between 0 and 100' });
  }

  if (projectStatus && !VALID_STATUSES.includes(projectStatus)) {
    return res.status(400).json({ error: `projectStatus must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const inspection = await prisma.inspection.create({
    data: {
      projectId,
      officerId: req.user.id,
      officerName: req.user.name,
      percentComplete: percent,
      delays: delays || null,
      notes: notes || null,
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
    },
  });

  if (projectStatus) {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: projectStatus },
    });
  }

  res.status(201).json({ inspection });
});

module.exports = router;
