import jwt from 'jsonwebtoken';

/**
 * Express middleware that validates the admin JWT from the Authorization header.
 * Attaches `req.admin = { sub, role }` on success.
 */
export function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient role' });
    }
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
