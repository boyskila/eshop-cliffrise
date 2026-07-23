import en from '../../public/locales/en/translations.json'
import bg from '../../public/locales/bg/translations.json'
import { DEFAULT_LANG } from '@constants'
import type { Locale, Translations } from '@types'
import { ensureTrailingSlash } from '@utils/siteUrls'

const FOREIGN_VISITOR_LANG: Locale = 'en'
const BULGARIA_COUNTRY_CODE = 'BG'
const CLOUDFLARE_COUNTRY_HEADER = 'CF-IPCountry'

export const getTranslations = (params: { lang?: Locale }): Translations => {
  const lang = getLang(params)
  return lang === 'en' ? en : bg
}

export const getLang = (params: { lang?: Locale }) => {
  return params.lang ?? DEFAULT_LANG
}

export const getDetectedLang = (request: Request): Locale => {
  const country = request.headers
    .get(CLOUDFLARE_COUNTRY_HEADER)
    ?.trim()
    ?.toUpperCase()

  if (country === BULGARIA_COUNTRY_CODE) {
    return DEFAULT_LANG
  }

  return FOREIGN_VISITOR_LANG
}

export const getLocaleRedirectUrl = (request: Request, url: URL): URL => {
  const locale = getDetectedLang(request)
  const redirectUrl = new URL(url)
  const localizedPathname =
    url.pathname === '/' ? `/${locale}/` : `/${locale}${url.pathname}`
  redirectUrl.pathname = ensureTrailingSlash(localizedPathname)

  return redirectUrl
}

export const setLocaleRedirectHeaders = (headers: Headers): void => {
  headers.set('Cache-Control', 'no-store')
  headers.set('Vary', CLOUDFLARE_COUNTRY_HEADER)
}
