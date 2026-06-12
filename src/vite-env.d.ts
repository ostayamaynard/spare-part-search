/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EED_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
