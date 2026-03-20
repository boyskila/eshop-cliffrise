import en from '../public/locales/en/translations.json'

type ProductKind = {
  name: string
  image?: string
}

export type Product = {
  id: string
  image: string
  name: string
  category: 'chalk' | 'apparel'
  description: string
  images: string[]
  price: number
  kind: ProductKind[]
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
