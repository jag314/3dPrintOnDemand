-- ── Shipping configuration ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shipping_config (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier            text        NOT NULL DEFAULT 'correos_cr',
  margin_percent     numeric     NOT NULL DEFAULT 5,
  packaging_weight_g integer     NOT NULL DEFAULT 150,
  updated_at         timestamptz DEFAULT now(),
  updated_by         text
);

INSERT INTO shipping_config (carrier, margin_percent, packaging_weight_g)
VALUES ('correos_cr', 5, 150)
ON CONFLICT DO NOTHING;

-- ── Carrier base rates ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shipping_rates (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier           text    NOT NULL DEFAULT 'correos_cr',
  origin_zone       text    NOT NULL,
  destination_zone  text    NOT NULL,
  first_kg_crc      numeric NOT NULL,
  additional_kg_crc numeric NOT NULL,
  effective_date    date    DEFAULT CURRENT_DATE
);

-- PYMEXPRESS Categoría Emprendedor desde GAM (vigente 2025)
INSERT INTO shipping_rates
  (carrier, origin_zone, destination_zone, first_kg_crc, additional_kg_crc)
VALUES
  ('correos_cr', 'GAM',  'GAM',  1942.50, 1000),
  ('correos_cr', 'GAM',  'RESTO', 2636.25, 1000)
ON CONFLICT DO NOTHING;

-- ── Add delivery cost column to orders ───────────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_cost_crc integer DEFAULT 0;
