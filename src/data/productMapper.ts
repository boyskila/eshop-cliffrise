import type Stripe from 'stripe'
import type { Product } from '@types'
import { isString } from '@utils/func'
import {
  parseProductCatalogMetadata,
  parseProductLocaleMetadata,
} from './productMetadata'
import { resolveProductImage } from './productImages'

const getStripeProductPrice = (
  defaultPrice: string | Stripe.Price | Stripe.DeletedPrice | null | undefined,
  productId: string,
) => {
  const isDefaultPricePresent = defaultPrice && !isString(defaultPrice)
  const isExpandedStripePrice = isDefaultPricePresent && !defaultPrice.deleted
  if (isExpandedStripePrice && defaultPrice.unit_amount !== null) {
    return defaultPrice.unit_amount / 100
  }
  throw new Error(`Missing expanded Stripe price for product "${productId}"`)
}

export const mapStripeProductToProduct = (
  stripeProduct: Stripe.Product,
  lang: string,
): Product => {
  const localizedMetadata = parseProductLocaleMetadata(
    stripeProduct.metadata,
    lang,
  )
  const catalogMetadata = parseProductCatalogMetadata(stripeProduct.metadata)

  return {
    id: stripeProduct.id,
    href: `/${lang}/products/${catalogMetadata.slug}/`,
    slug: catalogMetadata.slug,
    name: localizedMetadata.name,
    description: localizedMetadata.description ?? '',
    kind: localizedMetadata.kind.map((kind) => ({
      name: kind.name,
      image: kind.image
        ? resolveProductImage(`${catalogMetadata.imageFolder}${kind.image}`)
        : undefined,
      inStock: kind.inStock ?? true,
    })),
    price: getStripeProductPrice(stripeProduct.default_price, stripeProduct.id),
    weight: catalogMetadata.weight,
    image: resolveProductImage(
      `${catalogMetadata.imageFolder}${catalogMetadata.mainImage}`,
    ),
    images: catalogMetadata.images.map((image) =>
      resolveProductImage(`${catalogMetadata.imageFolder}${image}`),
    ),
    kindTitle: localizedMetadata.kindTitle,
    productPageTitle: localizedMetadata.productPageTitle,
  }
}
