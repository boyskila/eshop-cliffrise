import type { Locale } from '@types'
import validator from 'validator'

export const escapeHtml = (value: string) => {
  return validator.escape(value)
}

export const sanitizeInput = (value: string) => {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const sanitizeMessage = (value: string) => {
  return validator.stripLow(value, true).replace(/\r\n/g, '\n').trim()
}

export const isPresent = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined
}

export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

export const isTestMode = import.meta.env.MODE === 'test'

const PRICE_LOCALE_MAP: Record<string, string> = {
  bg: 'bg-BG',
  en: 'en-GB',
}

export const formatPrice = (
  price: number,
  locale: Locale = 'en',
  currency = 'EUR',
) => {
  const normalizedLocale = PRICE_LOCALE_MAP[locale] ?? locale
  const formatter = new Intl.NumberFormat(normalizedLocale, {
    style: 'currency',
    currency,
  })
  return formatter.format(price)
}
