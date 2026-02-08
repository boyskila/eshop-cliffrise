/// <reference types="astro/client" />

declare namespace App {
  interface SessionData {
    cart: import('@actions').CartItem[]
  }
}

interface ImportMetaEnv {
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
