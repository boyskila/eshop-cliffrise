import en from '../public/locales/en/translations.json'

export type Product = {
  id: string
  image: string
  name: string
  category: 'chalk' | 'apparel'
  description: string
  features: string[]
  price: number
}

export type Translations = typeof en

export type EmailData = {
  from: string
  to: string
  subject: string
  html: string
  replyTo?: string
}

export type EmailResult = {
  success: boolean
  error?: string
}

export type EmailService = {
  send(data: EmailData): Promise<EmailResult>
}
