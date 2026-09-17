const express = require('express');
const prisma = require('../db');

const router = express.Router();

// GET /api/projects - list, for the public map and either app.
// Supports ?region= and ?status= filters.
router.get('/', async (req, res) => {
const { region, status } = req.query;
const where = {};
if (region) where.region = region;
if (status) where.status = status;

const projects = await prisma.project.findMany({
where,
include: { contractor: true },
orderBy: { updatedAt: 'desc' },
});

res.json(projects);
});

// GET /api/projects/:id - one project with its verified inspections and
// community reports, kept as separate arrays so callers never merge them.
router.get('/:id', async (req, res) => {
const project = await prisma.project.findUnique({
where: { id: req.params.id },
include: {
contractor: true,
inspections: { orderBy: { inspectionDate: 'desc' } },
communityReports: { orderBy: { submittedAt: 'desc' } },
},
});

if (!project) {
return res.status(404).json({ error: 'Project not found' });
}

res.json(project);
});

module.exports = router;
