import { getStripe } from '@services/stripe'
import { getMockProducts } from './mockProducts'
import { PRODUCT_IMAGES } from './productImages'
import type { Product, ProductKind } from '@types'
import type { ImageMetadata } from 'astro'

const isTest = import.meta.env.MODE === 'test'

const normalizeImageKey = (key: string) =>
  key
    .replace(/\\/g, '/')
    .replace(/^\/?src\/assets\/images\/products\//, '')
    .replace(/^\/+/, '')
    .replace(/\.[^.]+$/, '')

const resolveImage = (key: string): ImageMetadata | string => {
  const normalizedKey = normalizeImageKey(key)

  return PRODUCT_IMAGES[normalizedKey] ?? key
}

export const getProducts = async (lang: string): Promise<Product[]> => {
  if (isTest) {
    return getMockProducts(lang)
  }

  const stripe = getStripe()
  const productsList = await stripe.products.list({
    expand: ['data.default_price'],
  })
  return productsList.data.map((stripeProduct) => {
    const { metadata } = stripeProduct
    const { name, description, kind, kindTitle, inStock } = JSON.parse(
      metadata[lang],
    )
    const {
      images,
      'image-folder': imageFolder,
      'main-image': mainImage,
      weight,
      slug,
    } = metadata

    return {
      id: stripeProduct.id,
      href: `/${lang}/products/${slug}/`,
      slug,
      name,
      description: description ?? '',
      kind: kind.map(({ name, image, inStock }: ProductKind) => ({
        name,
        image: resolveImage(`${imageFolder}${image}`),
        inStock: inStock === undefined ? true : inStock,
      })),
      price: (stripeProduct.default_price as any).unit_amount / 100,
      weight: parseFloat(weight),
      image: resolveImage(`${imageFolder}${mainImage}`),
      images: JSON.parse(images).map((img: string) =>
        resolveImage(`${imageFolder}${img}`),
      ),
      kindTitle,
      inStock: inStock === undefined ? true : inStock,
    } as Product
  })
}
