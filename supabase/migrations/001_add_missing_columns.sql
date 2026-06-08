-- ── Migration 001 — Inity 3D ─────────────────────────────────────────────────
-- Brings the Supabase schema in sync with server/routes/orders.js and
-- server/routes/admin.js.
--
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run.
--
-- All statements are safe to re-run (IF NOT EXISTS / IF EXISTS guards).
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 1 — Rename legacy columns that the code uses under different names
-- ═══════════════════════════════════════════════════════════════════════════════
-- These DO blocks are safe: they check if the old name exists before renaming.
-- If your DB was already created with the new names, these are no-ops.

DO $$
BEGIN
  -- orders.status → orders.order_status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_status'
  ) THEN
    ALTER TABLE orders RENAME COLUMN status TO order_status;
  END IF;

  -- orders.scale_pct → orders.scale_applied
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'scale_pct'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'scale_applied'
  ) THEN
    ALTER TABLE orders RENAME COLUMN scale_pct TO scale_applied;
  END IF;

  -- order_status_log.old_status → from_status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_status_log' AND column_name = 'old_status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_status_log' AND column_name = 'from_status'
  ) THEN
    ALTER TABLE order_status_log RENAME COLUMN old_status TO from_status;
  END IF;

  -- order_status_log.new_status → to_status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_status_log' AND column_name = 'new_status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_status_log' AND column_name = 'to_status'
  ) THEN
    ALTER TABLE order_status_log RENAME COLUMN new_status TO to_status;
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 2 — Drop the legacy NOT NULL constraint on `ref`
-- ═══════════════════════════════════════════════════════════════════════════════
-- The old schema had `ref TEXT UNIQUE NOT NULL`. The Express API never inserts
-- into `ref` (it uses reference_number SERIAL), so this constraint causes every
-- order insert to fail with a NOT NULL violation.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'ref'
  ) THEN
    ALTER TABLE orders ALTER COLUMN ref DROP NOT NULL;
    ALTER TABLE orders ALTER COLUMN ref DROP DEFAULT;
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 3 — Add missing columns to `orders`
-- ═══════════════════════════════════════════════════════════════════════════════

-- Auto-incrementing reference number for human-readable order IDs (#1, #2, …)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reference_number BIGSERIAL;

-- Order and payment lifecycle status
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status     TEXT NOT NULL DEFAULT 'pending_verification';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status   TEXT NOT NULL DEFAULT 'pending';

-- Customer contact details
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name    TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone   TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_company TEXT;

-- Model file info
ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_filename  TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS scale_applied      INTEGER NOT NULL DEFAULT 100;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dimensions_x_mm    NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dimensions_y_mm    NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dimensions_z_mm    NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS weight_original_g  NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS weight_effective_g NUMERIC;

-- Print configuration
ALTER TABLE orders ADD COLUMN IF NOT EXISTS technology        TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS material          TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS color             TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity          INTEGER NOT NULL DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS supports_required BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS printer_assigned  TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS print_time_min    INTEGER;

-- Pricing breakdown (all values in CRC colones, stored as INTEGER)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price_crc        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_material_crc     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_support_crc      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_electricity_crc  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_labor_crc        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_amortization_crc INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_failures_crc     INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_urgent             BOOLEAN NOT NULL DEFAULT false;

-- Payment details
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method        TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sinpe_number          TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sinpe_screenshot_path TEXT;

-- Delivery details
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type      TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_province  TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_canton    TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_district  TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address   TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_branch    TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_recipient TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_cedula    TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes     TEXT;

-- Full order payload as JSONB (stored alongside flat columns for flexibility)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS metadata JSONB;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 4 — Add missing columns to `order_status_log`
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE order_status_log ADD COLUMN IF NOT EXISTS from_status TEXT;
ALTER TABLE order_status_log ADD COLUMN IF NOT EXISTS to_status   TEXT;
ALTER TABLE order_status_log ADD COLUMN IF NOT EXISTS note        TEXT;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 5 — Add useful indexes for the new columns
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_reference_number
  ON orders(reference_number);

CREATE INDEX IF NOT EXISTS idx_orders_order_status
  ON orders(order_status);

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON orders(payment_status);


-- ═══════════════════════════════════════════════════════════════════════════════
-- Done.
-- Verify with: SELECT column_name, data_type FROM information_schema.columns
--              WHERE table_name = 'orders' ORDER BY ordinal_position;
-- ═══════════════════════════════════════════════════════════════════════════════
