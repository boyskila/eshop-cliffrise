import en from '../../public/locales/en/translations.json'
import bg from '../../public/locales/bg/translations.json'
import { DEFAULT_LANG } from '../../src/constants'
import type { Translations } from '../../src/types'

export const getTranslations = (lang = DEFAULT_LANG): Translations => {
  return lang === 'en' ? en : bg
}
