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
