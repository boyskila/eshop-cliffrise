import en from '../../public/locales/en/translations.json'
import bg from '../../public/locales/bg/translations.json'
import { DEFAULT_LANG } from '@constants'
import type { Locale, Translations } from '@types'

export const getTranslations = (params: { lang?: Locale }): Translations => {
  const lang = getLang(params)
  return lang === 'en' ? en : bg
}

export const getLang = (params: { lang?: Locale }) => {
  return params.lang ?? DEFAULT_LANG
}
