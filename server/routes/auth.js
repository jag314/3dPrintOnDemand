import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token }
 *
 * ADMIN_PASSWORD must be a bcrypt hash (cost ≥ 10).
 * Generate: node -e "require('bcryptjs').hash('yourpass', 12).then(console.log)"
 */
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const validUser = process.env.ADMIN_USERNAME;
  const validHash = process.env.ADMIN_PASSWORD;

  if (!validUser || !validHash) {
    return res.status(500).json({ error: 'Admin credentials not configured on server' });
  }

  const usernameMatch = username === validUser;
  // bcrypt.compare is timing-safe; always run it even on username mismatch
  // to prevent username enumeration via response time differences.
  const passwordMatch = await bcrypt.compare(password, validHash).catch(() => false);

  if (!usernameMatch || !passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT secret not configured on server' });
  }

  const token = jwt.sign(
    { sub: username, role: 'admin' },
    secret,
    { expiresIn: '8h' }
  );

  res.json({ token });
});

export default router;
