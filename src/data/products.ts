import { getStripe } from '@services/stripe'
import { getMockProducts } from './mockProducts'
import type { Product } from '@types'
import { isTestMode } from '@utils/func'
import { mapStripeProductToProduct } from './productMapper'

const listStripeProducts = () => {
  const stripe = getStripe()
  return stripe.products.list({
    expand: ['data.default_price'],
  })
}

export const getProducts = async (lang: string): Promise<Product[]> => {
  if (isTestMode) {
    return getMockProducts(lang)
  }

  const productsList = await listStripeProducts()
  return productsList.data.map((stripeProduct) =>
    mapStripeProductToProduct(stripeProduct, lang),
  )
}
