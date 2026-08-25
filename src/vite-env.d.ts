/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /**
   * Netlify build hook. Optional: when set, the admin rates screen can trigger
   * a rebuild so prerendered HTML and llms.txt catch up with a price change.
   */
  readonly VITE_NETLIFY_BUILD_HOOK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
