import en from '../../public/locales/en/translations.json'
import bg from '../../public/locales/bg/translations.json'
import { DEFAULT_LANG } from '../../src/constants'

export function getTranslations(lang = DEFAULT_LANG) {
  return lang === 'en' ? en : bg
}
