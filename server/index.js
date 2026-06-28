import './env.js';  // explicit-path dotenv load — must precede all other imports
import express    from 'express';
import cors       from 'cors';
import rateLimit  from 'express-rate-limit';
import ordersRouter   from './routes/orders.js';
import adminRouter    from './routes/admin.js';
import authRouter     from './routes/auth.js';
import shippingRouter from './routes/shipping.js';
import contactRouter  from './routes/contact.js';

const app  = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

// In development, accept any localhost port (Vite increments the port when
// 5173 is busy, so hardcoding a single port breaks login on port changes).
// In production, restrict to the real Vercel domain + any CLIENT_ORIGIN override.
const prodOrigins = [
  'https://www.inity3d.com',
  'https://inity3d.com',
  'https://3d-print-on-demand-gilt.vercel.app',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // server-to-server / curl
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin))
      return cb(null, true);
    if (prodOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// ── Rate limiters ─────────────────────────────────────────────────────────────

// 10 STL uploads per IP per hour — prevent storage abuse
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Upload limit reached. Try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5 contact form submissions per IP per hour — prevent email spam
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many contact requests. Try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api/orders',   uploadLimiter, ordersRouter);
app.use('/api/admin',    adminRouter);
app.use('/api/auth',     authRouter);
app.use('/api/shipping', shippingRouter);
app.use('/api/contact',  contactLimiter, contactRouter);

// Catch-all: unknown /api/* routes
app.use('/api', (_, res) => res.status(404).json({ error: 'Unknown API endpoint' }));

app.listen(PORT, () => {
  console.log(`Inity 3D API server → http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
