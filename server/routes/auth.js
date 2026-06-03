import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token }
 *
 * Credentials are checked against ADMIN_USERNAME / ADMIN_PASSWORD env vars.
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;

  if (!validUser || !validPass) {
    return res.status(500).json({ error: 'Admin credentials not configured on server' });
  }

  if (username !== validUser || password !== validPass) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: username, role: 'admin' },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token });
});

export default router;
