import type { ImageMetadata } from 'astro'

const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/products/**/*.webp',
  { eager: true },
)

const pathToKey = (path: string) =>
  path.replace('/src/assets/images/products/', '').replace(/\.webp$/, '')

export const PRODUCT_IMAGES: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(imageModules).map(([path, module]) => [pathToKey(path), module.default]),
)
