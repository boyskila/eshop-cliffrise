import en from '../public/locales/en/translations.json'

export type ProductKind = {
  name: string
  image?: string
  inStock: boolean
}

export type Product = {
  id: string
  image: string
  name: string
  description: string
  images: string[]
  price: number
  kind: ProductKind[]
  kindTitle?: string
}

export type Translations = typeof en
export type ProductTranslations = typeof en.product

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

export type ShippingInfo = {
  courier: 'speedy'
  name: string
  phone: string
  office: string
}
