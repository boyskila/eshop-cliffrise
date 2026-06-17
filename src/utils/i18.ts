import en from '../../public/locales/en/translations.json'
import bg from '../../public/locales/bg/translations.json'
import { DEFAULT_LANG } from '@constants'
import type { Locale, Translations } from '@types'

const FOREIGN_VISITOR_LANG: Locale = 'en'
const BULGARIA_COUNTRY_CODE = 'BG'
const CLOUDFLARE_COUNTRY_HEADER = 'cf-ipcountry'

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
    ?.toUpperCase()

  if (!country || country === BULGARIA_COUNTRY_CODE) {
    return DEFAULT_LANG
  }

  return FOREIGN_VISITOR_LANG
}
