import { defineMiddleware } from 'astro:middleware'
import { DEFAULT_LANG, SUPPORTED_LANGS } from '@constants'
import type { Locale } from '@types'

const FOREIGN_VISITOR_LANG: Locale = 'en'
const BULGARIA_COUNTRY_CODE = 'BG'
const CLOUDFLARE_COUNTRY_HEADER = 'cf-ipcountry'

const hasLocalePrefix = (pathname: string) => {
  return SUPPORTED_LANGS.some(
    (lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`),
  )
}

const shouldSkipLocaleRedirect = (pathname: string) => {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_') ||
    pathname.includes('.')
  )
}

const getCountry = (request: Request) => {
  return request.headers.get(CLOUDFLARE_COUNTRY_HEADER)?.toUpperCase()
}

const getLocale = (request: Request): Locale => {
  const country = getCountry(request)

  if (!country || country === BULGARIA_COUNTRY_CODE) {
    return DEFAULT_LANG
  }

  return FOREIGN_VISITOR_LANG
}

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url

  if (!['GET', 'HEAD'].includes(context.request.method)) {
    return next()
  }

  if (hasLocalePrefix(pathname) || shouldSkipLocaleRedirect(pathname)) {
    return next()
  }

  const locale = getLocale(context.request)
  const redirectUrl = new URL(context.url)
  redirectUrl.pathname = `/${locale}${pathname === '/' ? '/' : pathname}`
  const response = context.redirect(redirectUrl.toString(), 302)

  response.headers.set('Cache-Control', 'no-store')

  return response
})
