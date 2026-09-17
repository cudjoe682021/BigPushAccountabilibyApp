const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const TOKEN_TTL = '12h';

// POST /api/auth/login — email + password in, a JWT out. There is no public
// registration endpoint; accounts are created with scripts/seedAdmin.js or
// directly by an admin, since this is an internal field-officer/admin tool.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });

  res.json({ token, user: payload });
});

// GET /api/auth/me — lets the dashboard confirm a stored token is still
// valid and repopulate the logged-in user's name/role after a page reload.
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
