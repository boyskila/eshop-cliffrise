/// <reference types="astro/client" />

declare namespace App {
  interface SessionData {
    cart: import('@actions').CartItem[]
  }
}

interface Window {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}
