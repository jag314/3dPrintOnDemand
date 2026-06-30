// db/seed.mjs
// Seeds printers, materials, settings tables with real business data.
// Tables must exist first — run db/001_config_tables.sql in Supabase dashboard.
//
// Usage: node db/seed.mjs

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
config({ path: resolve(root, '.env') });
config({ path: resolve(root, '.env.local'), override: false });

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// ── Real business values — NOT code defaults ──────────────────────

const SETTINGS = {
  id:                    1,
  business_name:         'Inity 3D',
  email:                 'hola@inity3d.com',
  whatsapp:              '+506 7290-4402',
  address:               'Costa Rica',
  currency:              'CRC',
  apply_vat:             true,
  vat_rate:              13,
  commercial_markup:     2,
  urgency_semi:          0.10,
  urgency_urgent:        0.25,
  minimum_price:         0,
  quote_valid_days:      3,
  welcome_message:       'Completa tus datos y te enviamos una cotización formal en menos de 2 horas',
  response_time_h:       2,
  notification_email:    '',
  low_stock_alert:       1,
  support_light_mat:     25,
  support_light_time:    25,
  support_moderate_mat:  50,
  support_moderate_time: 50,
  support_heavy_mat:     75,
  support_heavy_time:    75,
  infill_weight_factor:  0.65,
};

const PRINTERS = [
  {
    id:                    'hi-combo-001',
    name:                  'Creality Hi Combo',
    technology:            'fdm',
    status:                'active',
    purchase_price_crc:    340000,
    amortization_years:    2,
    days_per_year:         312,
    hours_per_day:         10,
    watts_consumption:     350,
    electricity_rate_crc:  153,
    print_speed_profiles:  { standard: { gPerHour: 18, label: 'Estándar' } },
    default_profile:       'standard',
    build_volume:          { x: 260, y: 260, z: 300 },
    max_temp_nozzle:       300,
    max_temp_bed:          110,
    has_enclosure:         false,
    operator_rate_crc:     3000,
    prep_hours:            0.5,
    post_hours:            0.5,
    failure_rate:          0.10,
    purchase_date:         '2026-01-01',
    notes:                 'Impresora principal FDM — Multicolor 4 colores (CFS), 500 mm/s',
    sort_order:            0,
  },
  {
    id:                    'k1c-001',
    name:                  'Creality K1C',
    technology:            'fdm',
    status:                'inactive',
    purchase_price_crc:    346500,
    amortization_years:    1,
    days_per_year:         312,
    hours_per_day:         10,
    watts_consumption:     350,
    electricity_rate_crc:  150,
    print_speed_profiles:  { standard: { gPerHour: 15, label: 'Estándar' } },
    default_profile:       'standard',
    build_volume:          { x: 220, y: 220, z: 250 },
    max_temp_nozzle:       300,
    max_temp_bed:          110,
    has_enclosure:         true,
    operator_rate_crc:     3500,
    prep_hours:            0.5,
    post_hours:            0.5,
    failure_rate:          0.10,
    purchase_date:         '2025-01-01',
    notes:                 'Impresora FDM secundaria',
    sort_order:            1,
  },
];

const MATERIALS = [
  {
    name: 'PLA+', technology: 'fdm',
    spool_weight_g: 1000, spool_price_crc: 11960, price_per_gram: 11.96,
    colors: [
      { name:'Blanco', hex:'#f0f0f0', premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
      { name:'Negro',  hex:'#1a1a1a', premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
      { name:'Gris',   hex:'#6b7280', premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
      { name:'Verde',  hex:'#22c55e', premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
      { name:'Azul',   hex:'#3b82f6', premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
      { name:'Rojo',   hex:'#ef4444', premium:false, hidden:false, useMaterialPrice:true, customPrice:11.96 },
    ],
    sort_order: 0,
  },
  {
    name: 'PETG', technology: 'fdm',
    spool_weight_g: 1000, spool_price_crc: 14040, price_per_gram: 14.04,
    colors: [
      { name:'Blanco', hex:'#f0f0f0', premium:false, hidden:false, useMaterialPrice:true, customPrice:14.04 },
      { name:'Negro',  hex:'#1a1a1a', premium:false, hidden:false, useMaterialPrice:true, customPrice:14.04 },
      { name:'Azul',   hex:'#3b82f6', premium:false, hidden:false, useMaterialPrice:true, customPrice:14.04 },
    ],
    sort_order: 1,
  },
  {
    name: 'ABS', technology: 'fdm',
    spool_weight_g: 1000, spool_price_crc: 15600, price_per_gram: 15.60,
    colors: [
      { name:'Blanco', hex:'#f0f0f0', premium:false, hidden:false, useMaterialPrice:true, customPrice:15.60 },
      { name:'Negro',  hex:'#1a1a1a', premium:false, hidden:false, useMaterialPrice:true, customPrice:15.60 },
    ],
    sort_order: 2,
  },
  {
    name: 'ASA', technology: 'fdm',
    spool_weight_g: 1000, spool_price_crc: 16640, price_per_gram: 16.64,
    colors: [
      { name:'Blanco', hex:'#f0f0f0', premium:false, hidden:false, useMaterialPrice:true, customPrice:16.64 },
      { name:'Negro',  hex:'#1a1a1a', premium:false, hidden:false, useMaterialPrice:true, customPrice:16.64 },
    ],
    sort_order: 3,
  },
  {
    name: 'Resina Estándar', technology: 'sla',
    spool_weight_g: 1000, spool_price_crc: 18200, price_per_gram: 18.20,
    density: 1.10, price_per_ml: 18.20,
    colors: [
      { name:'Gris',   hex:'#9ca3af', premium:false, hidden:false, useMaterialPrice:true, customPrice:18.20 },
      { name:'Blanco', hex:'#f0f0f0', premium:false, hidden:false, useMaterialPrice:true, customPrice:18.20 },
    ],
    sort_order: 4,
  },
  {
    name: 'Resina ABS-Like', technology: 'sla',
    spool_weight_g: 1000, spool_price_crc: 20800, price_per_gram: 20.80,
    density: 1.18, price_per_ml: 20.80,
    colors: [
      { name:'Gris',  hex:'#6b7280', premium:false, hidden:false, useMaterialPrice:true, customPrice:20.80 },
      { name:'Negro', hex:'#1a1a1a', premium:false, hidden:false, useMaterialPrice:true, customPrice:20.80 },
    ],
    sort_order: 5,
  },
];

async function seed() {
  console.log('Seeding Supabase…\n');

  const { error: sErr } = await supabase.from('settings').upsert(SETTINGS, { onConflict: 'id' });
  if (sErr) { console.error('❌ settings:', sErr.message); process.exit(1); }
  console.log('✅ settings');

  for (const p of PRINTERS) {
    const { error } = await supabase.from('printers').upsert(p, { onConflict: 'id' });
    if (error) { console.error(`❌ printer ${p.id}:`, error.message); process.exit(1); }
    console.log(`✅ printer: ${p.name}`);
  }

  for (const m of MATERIALS) {
    const { error } = await supabase.from('materials').upsert(m, { onConflict: 'name' });
    if (error) { console.error(`❌ material ${m.name}:`, error.message); process.exit(1); }
    console.log(`✅ material: ${m.name}`);
  }

  console.log('\nDone ✓');
}

seed().catch(err => { console.error(err); process.exit(1); });
