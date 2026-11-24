import type { ImageMetadata } from 'astro'
import type { Locale } from '@types'

const PRODUCT_IMAGES_ROOT = '/src/assets/images/products/'

export const PRODUCT_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/products/**/*.webp',
  { eager: true },
)

const withLocaleFolder = (path: string, lang: Locale) => {
  if (lang === 'bg') return path

  const lastSlash = path.lastIndexOf('/')
  return `${path.slice(0, lastSlash + 1)}${lang}/${path.slice(lastSlash + 1)}`
}

export const resolveProductImage = (
  relativePath: string,
  lang: Locale = 'bg',
): ImageMetadata => {
  const baseCandidates = [
    relativePath,
    `${PRODUCT_IMAGES_ROOT}${relativePath}`,
    `${PRODUCT_IMAGES_ROOT}${relativePath}.webp`,
  ]
  const candidates =
    lang === 'bg'
      ? baseCandidates
      : [
          ...baseCandidates.map((candidate) =>
            withLocaleFolder(candidate, lang),
          ),
          ...baseCandidates,
        ]
  const result = candidates
    .map((candidate) => PRODUCT_IMAGES[candidate]?.default)
    .find(Boolean)

  if (!result) {
    console.warn(`Image not found: ${relativePath} (locale: ${lang})`)
    console.log('Available keys:', Object.keys(PRODUCT_IMAGES))
  }
  return result as ImageMetadata
}
