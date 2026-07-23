import { defineMiddleware } from 'astro:middleware'
import { SUPPORTED_LANGS } from '@constants'
import { getLocaleRedirectUrl, setLocaleRedirectHeaders } from '@utils/i18'

const staticFileExtension =
  /\.(?:css|js|mjs|map|json|xml|txt|ico|png|jpe?g|webp|avif|svg|gif|woff2?|ttf|otf|pdf)$/i

const hasLocalePrefix = (pathname: string) => {
  return SUPPORTED_LANGS.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )
}

const shouldSkipLocaleRedirect = (pathname: string) => {
  return (
    pathname === '/api' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_') ||
    staticFileExtension.test(pathname)
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

  const redirectUrl = getLocaleRedirectUrl(context.request, context.url)
  const response = context.redirect(redirectUrl.toString(), 307)

  setLocaleRedirectHeaders(response.headers)

  return response
})
