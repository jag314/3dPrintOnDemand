-- ── Inity 3D – Supabase schema ───────────────────────────────────────────────
-- Run this script in your Supabase SQL editor once.
-- All prices are stored as INTEGER in CRC (colones) to avoid float rounding.

-- ── orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  TEXT PRIMARY KEY,
  ref                 TEXT UNIQUE NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending_verification',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- indexed query columns
  customer_email      TEXT,
  total_price_crc     INTEGER NOT NULL,
  scale_pct           INTEGER NOT NULL DEFAULT 100,

  -- STL storage paths in Supabase Storage bucket 'stl-files'
  stl_original_path   TEXT,
  stl_scaled_path     TEXT,       -- NULL if no scale was applied

  -- complete order payload (same shape as the frontend order object)
  metadata            JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email         ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at DESC);

-- ── order_status_log ─────────────────────────────────────────────────────────
-- Every status transition is appended here.
CREATE TABLE IF NOT EXISTS order_status_log (
  id          BIGSERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by  TEXT NOT NULL DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_status_log_order_id  ON order_status_log(order_id);
CREATE INDEX IF NOT EXISTS idx_status_log_changed_at ON order_status_log(changed_at DESC);

-- ── Row-Level Security ────────────────────────────────────────────────────────
-- The Express API connects with the service-role key, which bypasses RLS.
-- These policies apply when using the anon/user keys from the client (not used here).
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_log ENABLE ROW LEVEL SECURITY;

-- No public read/write — all access is through the authenticated Express server.
CREATE POLICY "deny all direct access to orders"
  ON orders FOR ALL USING (false);

CREATE POLICY "deny all direct access to order_status_log"
  ON order_status_log FOR ALL USING (false);
