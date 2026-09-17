const express = require('express');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const VALID_CATEGORIES = [
  'WORK_STOPPED',
  'NO_WORKERS',
  'ROAD_DAMAGED',
  'CONTRACTOR_WORKING',
  'OTHER',
];

const VALID_REVIEW_STATUSES = ['UNREVIEWED', 'VERIFIED', 'DISMISSED'];

const GROUPING_WINDOW_DAYS = 30;

// POST /api/community-reports — a resident's submission from the reporting
// app. Every report is stored as its own row (so individual photos, GPS,
// and contact details are never lost); grouping happens at read time in
// GET /grouped below, not by merging rows on write.
router.post('/', async (req, res) => {
  const {
    projectId,
    category,
    latitude,
    longitude,
    reporterName,
    reporterPhone,
    deviceFingerprint,
    mediaUrls,
  } = req.body;

  if (!projectId || !category || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      error: 'projectId, category, latitude, and longitude are required',
    });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const report = await prisma.communityReport.create({
    data: {
      projectId,
      category,
      latitude,
      longitude,
      reporterName: reporterName || null,
      reporterPhone: reporterPhone || null,
      deviceFingerprint: deviceFingerprint || null,
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
    },
  });

  // Let the submitter know how many other reports already exist on this
  // project + category in the current window, so the app can show
  // "6 others reported this" instead of nothing.
  const windowStart = new Date(Date.now() - GROUPING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const threadCount = await prisma.communityReport.count({
    where: { projectId, category, submittedAt: { gte: windowStart } },
  });

  res.status(201).json({ report, threadCount });
});

// GET /api/community-reports/grouped?projectId=... — reports grouped by
// category within the rolling window, for the officer queue (Phase 3) and
// for the alert job (Phase 5) to threshold against.
router.get('/grouped', async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) {
    return res.status(400).json({ error: 'projectId query param is required' });
  }

  const windowStart = new Date(Date.now() - GROUPING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const reports = await prisma.communityReport.findMany({
    where: { projectId, submittedAt: { gte: windowStart } },
    orderBy: { submittedAt: 'desc' },
  });

  const groups = {};
  for (const report of reports) {
    if (!groups[report.category]) {
      groups[report.category] = { category: report.category, count: 0, reports: [] };
    }
    groups[report.category].count += 1;
    groups[report.category].reports.push(report);
  }

  res.json(Object.values(groups));
});

// GET /api/community-reports?reviewStatus=UNREVIEWED&projectId=... — the
// officer/admin review queue. Defaults to UNREVIEWED so the dashboard's
// queue view only has to ask for reports nobody has acted on yet.
router.get('/', requireAuth, async (req, res) => {
  const { reviewStatus, projectId } = req.query;

  if (reviewStatus && !VALID_REVIEW_STATUSES.includes(reviewStatus)) {
    return res.status(400).json({
      error: `reviewStatus must be one of: ${VALID_REVIEW_STATUSES.join(', ')}`,
    });
  }

  const where = { reviewStatus: reviewStatus || 'UNREVIEWED' };
  if (projectId) where.projectId = projectId;

  const reports = await prisma.communityReport.findMany({
    where,
    include: { project: { select: { id: true, name: true, region: true } } },
    orderBy: { submittedAt: 'desc' },
  });

  res.json(reports);
});

// PATCH /api/community-reports/:id/review — an officer/admin marks a report
// VERIFIED or DISMISSED. This never touches the project's own status or the
// report's own category/location — reviewing is about the report queue,
// not about re-writing what a resident submitted. Only a logged inspection
// (POST /api/inspections) changes what the platform calls "verified."
router.patch('/:id/review', requireAuth, async (req, res) => {
  const { reviewStatus, reviewNote } = req.body;

  if (!reviewStatus || !['VERIFIED', 'DISMISSED'].includes(reviewStatus)) {
    return res.status(400).json({ error: 'reviewStatus must be VERIFIED or DISMISSED' });
  }

  const existing = await prisma.communityReport.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const report = await prisma.communityReport.update({
    where: { id: req.params.id },
    data: {
      reviewStatus,
      reviewNote: reviewNote || null,
      reviewedById: req.user.id,
    },
  });

  res.json({ report });
});

module.exports = router;
