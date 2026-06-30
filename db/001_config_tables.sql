-- ═══════════════════════════════════════════════════════════════════
-- Inity 3D — Config tables migration
-- Run once in: Supabase Dashboard → SQL Editor
-- Creates printers, materials, settings with public read RLS.
-- Writes go through Express service role (no write policies for anon).
-- ═══════════════════════════════════════════════════════════════════

-- ── printers ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS printers (
  id                    TEXT        PRIMARY KEY,
  name                  TEXT        NOT NULL,
  technology            TEXT        NOT NULL CHECK (technology IN ('fdm','sla')),
  status                TEXT        NOT NULL DEFAULT 'inactive'
                                    CHECK (status IN ('active','inactive','maintenance')),
  purchase_price_crc    NUMERIC     NOT NULL,
  amortization_years    NUMERIC     NOT NULL,
  days_per_year         NUMERIC     NOT NULL,
  hours_per_day         NUMERIC     NOT NULL,
  watts_consumption     NUMERIC     NOT NULL,
  electricity_rate_crc  NUMERIC     NOT NULL,
  print_speed_profiles  JSONB       NOT NULL DEFAULT '{"standard":{"gPerHour":18,"label":"Estándar"}}',
  default_profile       TEXT        NOT NULL DEFAULT 'standard',
  build_volume          JSONB       NOT NULL DEFAULT '{"x":260,"y":260,"z":300}',
  max_temp_nozzle       NUMERIC,
  max_temp_bed          NUMERIC,
  has_enclosure         BOOLEAN     NOT NULL DEFAULT false,
  operator_rate_crc     NUMERIC     NOT NULL,
  prep_hours            NUMERIC     NOT NULL DEFAULT 0.5,
  post_hours            NUMERIC     NOT NULL DEFAULT 0.5,
  failure_rate          NUMERIC     NOT NULL DEFAULT 0.1,
  purchase_date         DATE,
  notes                 TEXT,
  sla_speed_ml_per_hour NUMERIC,
  sort_order            INTEGER     NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE printers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_printers"
  ON printers FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON printers TO anon, authenticated;

-- ── materials ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materials (
  name            TEXT        PRIMARY KEY,
  technology      TEXT        NOT NULL CHECK (technology IN ('fdm','sla')),
  spool_weight_g  NUMERIC     NOT NULL DEFAULT 1000,
  spool_price_crc NUMERIC     NOT NULL,
  price_per_gram  NUMERIC     NOT NULL,
  density         NUMERIC,
  price_per_ml    NUMERIC,
  colors          JSONB       NOT NULL DEFAULT '[]',
  sort_order      INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_materials"
  ON materials FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON materials TO anon, authenticated;

-- ── settings — single row enforced by CHECK (id = 1) ─────────────
CREATE TABLE IF NOT EXISTS settings (
  id                    INTEGER     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  business_name         TEXT        NOT NULL DEFAULT 'Inity 3D',
  email                 TEXT        NOT NULL DEFAULT '',
  whatsapp              TEXT        NOT NULL DEFAULT '',
  address               TEXT        NOT NULL DEFAULT '',
  currency              TEXT        NOT NULL DEFAULT 'CRC',
  apply_vat             BOOLEAN     NOT NULL DEFAULT false,
  vat_rate              NUMERIC     NOT NULL DEFAULT 13,
  commercial_markup     NUMERIC     NOT NULL DEFAULT 2.5,
  urgency_semi          NUMERIC     NOT NULL DEFAULT 0.20,
  urgency_urgent        NUMERIC     NOT NULL DEFAULT 0.50,
  minimum_price         NUMERIC     NOT NULL DEFAULT 0,
  quote_valid_days      INTEGER     NOT NULL DEFAULT 3,
  welcome_message       TEXT        NOT NULL DEFAULT '',
  response_time_h       INTEGER     NOT NULL DEFAULT 2,
  notification_email    TEXT        NOT NULL DEFAULT '',
  low_stock_alert       INTEGER     NOT NULL DEFAULT 1,
  support_light_mat     NUMERIC     NOT NULL DEFAULT 5,
  support_light_time    NUMERIC     NOT NULL DEFAULT 8,
  support_moderate_mat  NUMERIC     NOT NULL DEFAULT 15,
  support_moderate_time NUMERIC     NOT NULL DEFAULT 20,
  support_heavy_mat     NUMERIC     NOT NULL DEFAULT 30,
  support_heavy_time    NUMERIC     NOT NULL DEFAULT 40,
  infill_weight_factor  NUMERIC     NOT NULL DEFAULT 0.65,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_settings"
  ON settings FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON settings TO anon, authenticated;
