/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
  readonly VITE_SINPE_PHONE: string
  readonly VITE_SINPE_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
