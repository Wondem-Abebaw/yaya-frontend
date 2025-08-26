/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CURRENT_USER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}