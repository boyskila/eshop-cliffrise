import { defineMiddleware } from 'astro:middleware'
import { SUPPORTED_LANGS } from '@constants'
import { getDetectedLang } from '@utils/i18'

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

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url

  if (!['GET', 'HEAD'].includes(context.request.method)) {
    return next()
  }

  if (hasLocalePrefix(pathname) || shouldSkipLocaleRedirect(pathname)) {
    return next()
  }

  const locale = getDetectedLang(context.request)
  const redirectUrl = new URL(context.url)
  redirectUrl.pathname = `/${locale}${pathname === '/' ? '/' : pathname}`
  const response = context.redirect(redirectUrl.toString(), 302)

  response.headers.set('Cache-Control', 'no-store')

  return response
})
