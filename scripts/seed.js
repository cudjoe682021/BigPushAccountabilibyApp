// Phase 1: import the procurement dataset into Contractor + Project tables.
//
// Usage:
//   1. Put your export at data/procurement.csv (see data/README.md for columns)
//   2. npm run prisma:migrate   (creates the tables)
//   3. npm run seed

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CSV_PATH = path.join(__dirname, '..', 'data', 'procurement.csv');

// Edit these if your export uses different header names.
const COLUMNS = {
projectName: 'project_name',
location: 'location',
region: 'region',
latitude: 'latitude',
longitude: 'longitude',
contractorName: 'contractor_name',
contractValue: 'contract_value_ghs',
startDate: 'start_date',
expectedCompletion: 'expected_completion',
sourceReference: 'source_reference',
};

function parseDate(value) {
if (!value) return null;
const d = new Date(value);
return Number.isNaN(d.getTime()) ? null : d;
}

function parseNumber(value) {
if (value === undefined || value === null || value === '') return null;
const n = Number(String(value).replace(/,/g, ''));
return Number.isNaN(n) ? null : n;
}

async function main() {
if (!fs.existsSync(CSV_PATH)) {
console.error(`No dataset found at ${CSV_PATH}.`);
console.error('See data/README.md for the expected file and columns.');
process.exit(1);
}

const raw = fs.readFileSync(CSV_PATH, 'utf8');
const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

console.log(`Read ${rows.length} rows from ${CSV_PATH}`);

const contractorCache = new Map();
let created = 0;
let updated = 0;

for (const row of rows) {
const contractorName = row[COLUMNS.contractorName]?.trim();
if (!contractorName) {
console.warn('Skipping row with no contractor name:', row[COLUMNS.projectName]);
continue;
}

let contractor = contractorCache.get(contractorName);
if (!contractor) {
// Contractor.name has no unique constraint (real-world names vary too
// much to enforce one safely), so find-or-create instead of upsert.
contractor = await prisma.contractor.findFirst({ where: { name: contractorName } });
if (!contractor) {
contractor = await prisma.contractor.create({ data: { name: contractorName } });
}
contractorCache.set(contractorName, contractor);
}

const projectName = row[COLUMNS.projectName]?.trim();
if (!projectName) {
console.warn('Skipping row with no project name for contractor:', contractorName);
continue;
}

const existingProject = await prisma.project.findFirst({
where: { name: projectName, contractorId: contractor.id },
});

const data = {
name: projectName,
location: row[COLUMNS.location]?.trim() || 'Unknown',
region: row[COLUMNS.region]?.trim() || null,
latitude: parseNumber(row[COLUMNS.latitude]),
longitude: parseNumber(row[COLUMNS.longitude]),
contractorId: contractor.id,
contractValueGhs: parseNumber(row[COLUMNS.contractValue]),
startDate: parseDate(row[COLUMNS.startDate]),
expectedCompletion: parseDate(row[COLUMNS.expectedCompletion]),
sourceReference: row[COLUMNS.sourceReference]?.trim() || null,
};

if (existingProject) {
await prisma.project.update({ where: { id: existingProject.id }, data });
updated += 1;
} else {
await prisma.project.create({ data });
created += 1;
}
}

console.log(`Done. Created ${created} projects, updated ${updated} projects.`);
}

main()
.catch((err) => {
console.error(err);
process.exit(1);
})
.finally(() => prisma.$disconnect());
