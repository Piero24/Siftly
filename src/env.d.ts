/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_ALLOW_LOCAL_ONLY: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_BUILD_TARGET: 'web' | 'extension';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
// Initial release test
