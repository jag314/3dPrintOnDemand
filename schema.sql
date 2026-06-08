-- ── Inity 3D – Supabase schema (complete, authoritative) ─────────────────────
-- This file documents the full production schema.
-- To set up a fresh database: run this script in Supabase Dashboard → SQL Editor.
-- To update an existing database: run supabase/migrations/001_add_missing_columns.sql
--
-- All prices are stored as INTEGER in CRC (colones) to avoid float rounding.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── orders ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  -- Identity
  id                  TEXT PRIMARY KEY,          -- UUID, supplied by Express (matches Storage path)
  reference_number    BIGSERIAL UNIQUE,          -- Human-readable order number: #1, #2, …

  -- Lifecycle
  order_status        TEXT NOT NULL DEFAULT 'pending_verification',
  payment_status      TEXT NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Customer
  customer_email      TEXT,
  customer_name       TEXT,
  customer_phone      TEXT,
  customer_company    TEXT,

  -- Model file
  original_filename   TEXT,
  scale_applied       INTEGER NOT NULL DEFAULT 100,
  dimensions_x_mm     NUMERIC,
  dimensions_y_mm     NUMERIC,
  dimensions_z_mm     NUMERIC,
  weight_original_g   NUMERIC,
  weight_effective_g  NUMERIC,

  -- Storage paths in Supabase Storage bucket 'stl-files'
  stl_original_path   TEXT,
  stl_scaled_path     TEXT,        -- NULL when no scaling was applied

  -- Print configuration
  technology          TEXT,        -- 'fdm' | 'sla'
  material            TEXT,
  color               TEXT,
  quantity            INTEGER NOT NULL DEFAULT 1,
  supports_required   BOOLEAN NOT NULL DEFAULT false,
  printer_assigned    TEXT,
  print_time_min      INTEGER,

  -- Pricing (all CRC colones, INTEGER)
  unit_price_crc          INTEGER NOT NULL DEFAULT 0,
  total_price_crc         INTEGER NOT NULL DEFAULT 0,
  cost_material_crc       INTEGER NOT NULL DEFAULT 0,
  cost_support_crc        INTEGER NOT NULL DEFAULT 0,
  cost_electricity_crc    INTEGER NOT NULL DEFAULT 0,
  cost_labor_crc          INTEGER NOT NULL DEFAULT 0,
  cost_amortization_crc   INTEGER NOT NULL DEFAULT 0,
  cost_failures_crc       INTEGER NOT NULL DEFAULT 0,
  is_urgent               BOOLEAN NOT NULL DEFAULT false,

  -- Payment
  payment_method          TEXT,    -- 'sinpe' | 'onvo' | …
  sinpe_number            TEXT,
  sinpe_screenshot_path   TEXT,

  -- Delivery
  delivery_type       TEXT,        -- 'home' | 'branch' | 'pickup'
  delivery_province   TEXT,
  delivery_canton     TEXT,
  delivery_district   TEXT,
  delivery_address    TEXT,
  delivery_branch     TEXT,
  delivery_recipient  TEXT,
  delivery_cedula     TEXT,
  delivery_notes      TEXT,

  -- Full order payload (same shape as the frontend order object)
  metadata            JSONB
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_reference_number  ON orders(reference_number);
CREATE        INDEX IF NOT EXISTS idx_orders_order_status      ON orders(order_status);
CREATE        INDEX IF NOT EXISTS idx_orders_payment_status    ON orders(payment_status);
CREATE        INDEX IF NOT EXISTS idx_orders_email             ON orders(customer_email);
CREATE        INDEX IF NOT EXISTS idx_orders_created_at        ON orders(created_at DESC);


-- ── order_status_log ─────────────────────────────────────────────────────────
-- Every status transition is appended here — immutable audit trail.
CREATE TABLE IF NOT EXISTS order_status_log (
  id          BIGSERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,                                -- NULL on initial creation
  to_status   TEXT NOT NULL,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by  TEXT NOT NULL DEFAULT 'system',
  note        TEXT
);

CREATE INDEX IF NOT EXISTS idx_status_log_order_id   ON order_status_log(order_id);
CREATE INDEX IF NOT EXISTS idx_status_log_changed_at ON order_status_log(changed_at DESC);


-- ── Row-Level Security ────────────────────────────────────────────────────────
-- The Express API connects with the service-role key, which bypasses RLS.
-- These policies block any direct anon/user-key access from the browser.
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deny all direct access to orders"
  ON orders FOR ALL USING (false);

CREATE POLICY "deny all direct access to order_status_log"
  ON order_status_log FOR ALL USING (false);
