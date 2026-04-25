import type { CreateEmailOptions } from 'resend'
import type { ImageMetadata } from 'astro'
import en from '../public/locales/en/translations.json'

export type ProductKind = {
  name: string
  image?: ImageMetadata | string
  inStock: boolean
}

export type Product = {
  id: string
  image: ImageMetadata | string
  name: string
  description: string
  images: (ImageMetadata | string)[]
  price: number
  weight: number // actual product weight in kg, used for shipping calculation
  kind: ProductKind[]
  kindTitle?: string
  href: string
  slug?: string
  productPageTitle?: string
}

export type Translations = typeof en

export type EmailData = CreateEmailOptions

export type EmailResult = {
  success: boolean
  error?: string
}

export type EmailService = {
  send(data: EmailData): Promise<EmailResult>
}

export type ShippingInfo = {
  office: string
  officeId: number
}

export type SpeedyOffice = {
  id: number
  name?: string
  nameEn?: string
  address?: {
    fullAddressString?: string
    fullAddressStringEn?: string
    x?: number
    y?: number
  }
  type?: string
  workingTimeFrom?: string
  workingTimeTo?: string
  workingTimeHalfFrom?: string
  workingTimeHalfTo?: string
}

export type MapOffice = {
  id: number
  name: string
  nameEn: string
  address: string
  addressEn: string
  lat: number
  lng: number
  type: string
  workingTimeFrom: string | null
  workingTimeTo: string | null
  workingTimeHalfFrom: string | null
  workingTimeHalfTo: string | null
}
