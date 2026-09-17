// Phase 3: creates (or updates the password for) the first admin login.
// There is no public registration endpoint — this script, and an admin
// creating further accounts by hand in the database, are the only ways in.
//
// Usage:
//   Set ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME in .env (see .env.example
//   for defaults), then:
//
//   npm run seed:admin

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'change-me-immediately';
  const name = process.env.ADMIN_NAME || 'Admin';

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: 'ADMIN' },
    create: { email, passwordHash, name, role: 'ADMIN' },
  });

  console.log(`Admin user ready: ${user.email} (role: ${user.role})`);
  if (password === 'change-me-immediately') {
    console.warn('Using the default password — set ADMIN_PASSWORD in .env before deploying.');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
