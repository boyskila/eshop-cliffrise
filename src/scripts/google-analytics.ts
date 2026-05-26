const googleAnalyticsId = 'G-D9DXQP66G4'
const cookieConsentKey = 'cliffrise_cookie_consent'
const cookieConsentValue = 'accepted'

declare global {
  interface Window {
    __cliffriseGoogleAnalyticsLoaded?: boolean
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let lastTrackedPageUrl: string | null = null

const hasStoredCookieConsent = () => {
  try {
    return window.localStorage.getItem(cookieConsentKey) === cookieConsentValue
  } catch {
    return false
  }
}

const hasCookieConsent = () => hasStoredCookieConsent()

const getGtagCommand = () => {
  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer?.push(args)
    })

  return window.gtag
}

const loadGoogleAnalytics = () => {
  const gtag = getGtagCommand()

  if (window.__cliffriseGoogleAnalyticsLoaded) {
    return
  }

  window.__cliffriseGoogleAnalyticsLoaded = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`
  document.head.append(script)

  gtag('js', new Date())
  gtag('config', googleAnalyticsId, { send_page_view: false })
}

const trackPageView = () => {
  if (!hasCookieConsent()) {
    return
  }

  loadGoogleAnalytics()

  const pageUrl = window.location.href

  if (pageUrl === lastTrackedPageUrl) {
    return
  }

  lastTrackedPageUrl = pageUrl

  getGtagCommand()('event', 'page_view', {
    page_location: pageUrl,
    page_path: `${window.location.pathname}${window.location.search}`,
    page_title: document.title,
  })
}

trackPageView()

document.addEventListener('astro:page-load', trackPageView)
window.addEventListener('cliffrise:cookie-consent', trackPageView)

export {}
