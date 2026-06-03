import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ordersRouter from './routes/orders.js';
import adminRouter  from './routes/admin.js';
import authRouter   from './routes/auth.js';

const app  = express();
const PORT = process.env.PORT || 3001;

// Allow the Vite dev server (and any VITE_CLIENT_ORIGIN) to call us.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server calls (no origin) and listed origins.
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api/orders', ordersRouter);
app.use('/api/admin',  adminRouter);
app.use('/api/auth',   authRouter);

// Catch-all: unknown /api/* routes
app.use('/api', (_, res) => res.status(404).json({ error: 'Unknown API endpoint' }));

app.listen(PORT, () => {
  console.log(`Inity 3D API server → http://localhost:${PORT}`);
});
