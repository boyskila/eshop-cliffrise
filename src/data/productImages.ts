import type { ImageMetadata } from 'astro'
import type { ProductImage } from '@types'

export const PRODUCT_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/products/**/*.webp',
  { eager: true },
)

export const resolveProductImage = (relativePath: string): ProductImage => {
  return PRODUCT_IMAGES[relativePath]?.default ?? relativePath
}
