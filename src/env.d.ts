/// <reference types="astro/client" />

declare namespace App {
  interface SessionData {
    cart: import('@actions').CartItem[]
  }
}

interface Window {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  __gaConsentInitialized?: boolean
  __gaLoaded?: boolean
  __gaLoading?: boolean
  __gaLastPageView?: string
  __gaPendingPageView?: {
    page_title: string
    page_location: string
    page_path: string
  }
  __gaListenersBound?: boolean
}
