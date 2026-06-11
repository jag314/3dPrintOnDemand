-- ── Invoice / billing fields ─────────────────────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS requires_invoice  boolean DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_type      text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_name      text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_id_number text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_email     text;

-- ── Tax ───────────────────────────────────────────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_crc integer DEFAULT 0;
