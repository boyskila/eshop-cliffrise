import { SUPPORTED_LANGS } from '../constants'
import type { Locale } from '../types'

export const CANONICAL_ORIGIN = 'https://cliffrise.com'

export type HreflangAlternate = {
  lang: Locale | 'x-default'
  href: URL
}

const hasFileExtension = (pathname: string) => /\/[^/]+\.[^/]+$/.test(pathname)

const stripLocalePrefix = (pathname: string): string => {
  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0] as Locale | undefined

  if (firstSegment && SUPPORTED_LANGS.includes(firstSegment)) {
    pathSegments.shift()
  }

  return `/${pathSegments.join('/')}`
}

export const ensureTrailingSlash = (pathname: string): string => {
  if (
    pathname === '/' ||
    pathname.endsWith('/') ||
    hasFileExtension(pathname)
  ) {
    return pathname
  }

  return `${pathname}/`
}

export const getCanonicalSiteUrl = (): URL => new URL(`${CANONICAL_ORIGIN}/`)

export const normalizeSiteUrl = (siteUrl: string | URL): URL => {
  const normalizedUrl = new URL(siteUrl.toString())

  if (normalizedUrl.hostname === 'www.cliffrise.com') {
    normalizedUrl.protocol = 'https:'
    normalizedUrl.hostname = 'cliffrise.com'
  }

  normalizedUrl.pathname = '/'
  normalizedUrl.search = ''
  normalizedUrl.hash = ''

  return normalizedUrl
}

export const getCanonicalUrl = (url: string | URL): URL => {
  const inputUrl = new URL(url.toString(), getCanonicalSiteUrl())
  const canonicalUrl = getCanonicalSiteUrl()
  canonicalUrl.pathname = ensureTrailingSlash(inputUrl.pathname)

  return canonicalUrl
}

export const getLocalizedPathname = (
  pathname: string,
  locale: Locale,
): string => {
  const pathWithoutLocale = stripLocalePrefix(pathname)

  return ensureTrailingSlash(
    pathWithoutLocale === '/'
      ? `/${locale}/`
      : `/${locale}${pathWithoutLocale}`,
  )
}

export const getLocalizedAlternates = (
  pathname: string,
  availableLocales: readonly Locale[] = SUPPORTED_LANGS,
): HreflangAlternate[] => {
  if (availableLocales.length === 0) {
    return []
  }

  const localizedAlternates = availableLocales.map((locale) => ({
    lang: locale,
    href: getCanonicalUrl(getLocalizedPathname(pathname, locale)),
  }))
  const pathWithoutLocale = stripLocalePrefix(pathname)
  const englishIsAvailable = availableLocales.includes('en')
  const xDefaultLocale = englishIsAvailable ? 'en' : availableLocales[0]
  const xDefaultPathname =
    pathWithoutLocale === '/'
      ? '/'
      : getLocalizedPathname(pathWithoutLocale, xDefaultLocale)

  return [
    ...localizedAlternates,
    {
      lang: 'x-default',
      href: getCanonicalUrl(xDefaultPathname),
    },
  ]
}

export const getLocalizedProductUrls = (
  slugs: readonly string[],
  locales: readonly Locale[] = SUPPORTED_LANGS,
): string[] => {
  const uniqueSlugs = [...new Set(slugs)]

  return uniqueSlugs.flatMap((slug) =>
    locales.map(
      (locale) => getCanonicalUrl(`/${locale}/products/${slug}/`).href,
    ),
  )
}
