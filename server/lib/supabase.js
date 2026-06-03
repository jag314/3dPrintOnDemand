import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.'
  );
}

// Service-role client — bypasses RLS, never exposed to the browser.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default supabase;
export const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'stl-files';
