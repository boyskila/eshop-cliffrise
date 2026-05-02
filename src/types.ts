import type { CreateEmailOptions } from 'resend'
import type { ImageMetadata } from 'astro'
import en from '../public/locales/en/translations.json'

export type ProductImage = ImageMetadata | string

export type RenderImage = {
  src: string
  srcSet?: string
  sizes?: string
}

export type ProductGalleryImage = {
  thumbnail: RenderImage
  full: RenderImage
}

export type ProductKind = {
  name: string
  image?: ProductImage
  inStock: boolean
}

export type Product = {
  id: string
  image: ProductImage
  name: string
  description: string
  images: ProductImage[]
  price: number
  weight: number // actual product weight in kg, used for shipping calculation
  kind: ProductKind[]
  kindTitle?: string
  href: string
  slug?: string // url friendly identifier, used for product pages
  productPageTitle?: string
}

export type RenderedProductKind = Omit<ProductKind, 'image'> & {
  image?: RenderImage
}

export type RenderedProductCard = Omit<Product, 'image'> & {
  image: RenderImage
}

export type ProductLocaleKindMetadata = {
  name: string
  image?: string
  inStock?: boolean
}

export type ProductLocaleMetadata = {
  name: string
  description?: string | null
  kind: ProductLocaleKindMetadata[]
  kindTitle?: string
  inStock?: boolean
  productPageTitle?: string
}

export type ProductCatalogMetadata = {
  images: string[]
  imageFolder: string
  mainImage: string
  weight: number
  slug: string
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
