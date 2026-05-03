import type { ImageMetadata } from 'astro'

export const PRODUCT_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/products/**/*.webp',
  { eager: true },
)

export const resolveProductImage = (relativePath: string): ImageMetadata => {
  const result = PRODUCT_IMAGES[relativePath]?.default
  if (!result) {
    console.warn(`Image not found: ${relativePath}`)
    console.log('Available keys:', Object.keys(PRODUCT_IMAGES))
  }
  return result
}
