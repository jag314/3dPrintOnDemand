import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase admin environment variables')
}

// WARNING: This client bypasses Row Level Security.
// Only use this for order submission and admin operations.
// Never expose this key in the browser in production.
// TODO: In production, move all admin operations to a backend API
// (e.g. Supabase Edge Functions) so the service role key is never
// bundled in the frontend code.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
