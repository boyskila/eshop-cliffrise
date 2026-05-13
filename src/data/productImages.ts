import type { ImageMetadata } from 'astro'

export const PRODUCT_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/products/**/*.webp',
  { eager: true },
)

export const resolveProductImage = (relativePath: string): ImageMetadata => {
  const candidates = [
    relativePath,
    `/src/assets/images/products/${relativePath}`,
    `/src/assets/images/products/${relativePath}.webp`,
  ]
  const result = candidates
    .map((candidate) => PRODUCT_IMAGES[candidate]?.default)
    .find(Boolean)

  if (!result) {
    console.warn(`Image not found: ${relativePath}`)
    console.log('Available keys:', Object.keys(PRODUCT_IMAGES))
  }
  return result as ImageMetadata
}
