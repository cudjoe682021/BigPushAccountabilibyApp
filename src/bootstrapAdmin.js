// On Render's free tier there's no Shell access to run `npm run seed:admin`
// by hand after the first deploy (that requires a paid plan), so this runs
// the same logic automatically at server startup instead — but only when
// no users exist yet, so it never overwrites an admin's password on a
// later restart once accounts are real.
//
// scripts/seedAdmin.js still exists and still works the same way for
// local development or a host that does give you a shell.
const bcrypt = require('bcryptjs');
const prisma = require('./db');

async function ensureAdminSeeded() {
  const existingCount = await prisma.user.count();
  if (existingCount > 0) return;

  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'change-me-immediately';
  const name = process.env.ADMIN_NAME || 'Admin';

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: 'ADMIN' },
  });

  console.log(`No users found — created first admin: ${user.email}`);
  if (password === 'change-me-immediately') {
    console.warn('Using the default password — set ADMIN_PASSWORD before deploying.');
  }
}

module.exports = { ensureAdminSeeded };
