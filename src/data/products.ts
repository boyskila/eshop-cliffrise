import { getStripe } from '@services/stripe'
import { getMockProducts } from './mockProducts'
import type { Product, ProductKind } from '@types'

const isTest = import.meta.env.MODE === 'test'

export const getProducts = async (lang: string): Promise<Product[]> => {
  if (isTest) {
    return getMockProducts(lang)
  }

  const stripe = getStripe()
  const productsList = await stripe.products.list({
    expand: ['data.default_price'],
  })
  return productsList.data.map((stripeProduct) => {
    const metadata = stripeProduct.metadata
    const { name, description, kind, kindTitle, inStock } = JSON.parse(
      metadata[lang],
    )
    const {
      images,
      'image-folder': imageFolder,
      'main-image': mainImage,
      weight,
    } = metadata

    return {
      id: stripeProduct.id,
      name,
      description: description ?? '',
      kind: kind.map(({ name, image, inStock }: ProductKind) => ({
        name,
        image: `${imageFolder}${image}`,
        inStock: inStock === undefined ? true : inStock,
      })),
      price: (stripeProduct.default_price as any).unit_amount / 100,
      weight: parseFloat(weight),
      image: `${imageFolder}${mainImage}`,
      images: JSON.parse(images).map((img: string) => `${imageFolder}${img}`),
      kindTitle,
      inStock: inStock === undefined ? true : inStock,
    } as Product
  })
}
