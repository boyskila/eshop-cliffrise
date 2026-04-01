import { getStripe } from '@services/stripe'
import type { Product, ProductKind } from '@types'

export const getProducts = async (lang: string): Promise<Product[]> => {
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
      image: `${imageFolder}${mainImage}`,
      images: JSON.parse(images).map((img: string) => `${imageFolder}${img}`),
      kindTitle,
      inStock: inStock === undefined ? true : inStock,
    } as Product
  })
}
