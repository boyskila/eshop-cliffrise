import { getStripe } from '@services/stripe'
import type Stripe from 'stripe'
import { getMockProducts } from './mockProducts'
import type { Locale, Product } from '@types'
import { isTestMode } from '@utils/func'
import { mapStripeProductToProduct } from './productMapper'

const listStripeProducts = async (): Promise<Stripe.Product[]> => {
  const products: Stripe.Product[] = []
  const stripe = getStripe()

  for await (const product of stripe.products.list({
    active: true,
    limit: 100,
    expand: ['data.default_price'],
  })) {
    products.push(product)
  }

  return products
}

const mapProducts = (
  stripeProducts: Stripe.Product[],
  lang: Locale,
): Product[] => {
  return stripeProducts.map((stripeProduct) =>
    mapStripeProductToProduct(stripeProduct, lang),
  )
}

export const loadProducts = async (lang: Locale): Promise<Product[]> => {
  if (isTestMode) {
    return getMockProducts(lang)
  }

  return mapProducts(await listStripeProducts(), lang)
}

let buildStripeProducts: Promise<Stripe.Product[]> | undefined

export const loadBuildProducts = async (
  lang: Locale,
): Promise<Product[]> => {
  if (isTestMode) {
    return getMockProducts(lang)
  }

  buildStripeProducts ??= listStripeProducts()
  return mapProducts(await buildStripeProducts, lang)
}

export const getProducts = loadProducts
