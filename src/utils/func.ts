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
