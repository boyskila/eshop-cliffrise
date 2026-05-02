import { getImage } from 'astro:assets'
import { PRODUCT_CARD_IMAGE_SIZES, PRODUCT_IMAGE_SIZES } from '@constants'
import type {
  Product,
  ProductGalleryImage,
  ProductImage,
  ProductKind,
  RenderImage,
  RenderedProductCard,
  RenderedProductKind,
} from '@types'
import { isString } from './func'

const DEFAULT_IMAGE_FORMAT = 'webp' as const
const DEFAULT_IMAGE_QUALITY = 80

const PRODUCT_CARD_IMAGE_OPTIONS = {
  widths: [300, 500, 800, 1200],
  sizes: PRODUCT_CARD_IMAGE_SIZES,
  format: DEFAULT_IMAGE_FORMAT,
  quality: DEFAULT_IMAGE_QUALITY,
}

const PRODUCT_THUMBNAIL_IMAGE_OPTIONS = {
  width: 56,
  height: 56,
  format: DEFAULT_IMAGE_FORMAT,
  quality: DEFAULT_IMAGE_QUALITY,
}

const PRODUCT_DETAIL_IMAGE_OPTIONS = {
  widths: [400, 800, 1200],
  sizes: PRODUCT_IMAGE_SIZES,
  format: DEFAULT_IMAGE_FORMAT,
  quality: DEFAULT_IMAGE_QUALITY,
}

export const renderSizedImage = async (
  image: ProductImage,
  options: {
    width: number
    height: number
    format?: typeof DEFAULT_IMAGE_FORMAT
    quality?: number
  },
): Promise<RenderImage> => {
  if (isString(image)) {
    return { src: image }
  }

  const renderedImage = await getImage({
    src: image,
    width: options.width,
    height: options.height,
    format: options.format ?? DEFAULT_IMAGE_FORMAT,
    quality: options.quality ?? DEFAULT_IMAGE_QUALITY,
  })

  return { src: renderedImage.src }
}

export const renderResponsiveImage = async (
  image: ProductImage,
  options: {
    widths: number[]
    sizes: string
    format?: typeof DEFAULT_IMAGE_FORMAT
    quality?: number
  },
): Promise<RenderImage> => {
  if (isString(image)) {
    return {
      src: image,
      sizes: options.sizes,
    }
  }

  const renderedImage = await getImage({
    src: image,
    widths: options.widths,
    sizes: options.sizes,
    format: options.format ?? DEFAULT_IMAGE_FORMAT,
    quality: options.quality ?? DEFAULT_IMAGE_QUALITY,
  })

  return {
    src: renderedImage.src,
    srcSet: renderedImage.srcSet.attribute,
    sizes: options.sizes,
  }
}

export const prepareProductMainImage = (image: ProductImage) => {
  return renderResponsiveImage(image, PRODUCT_DETAIL_IMAGE_OPTIONS)
}

export const prepareProductCards = async (
  products: Product[],
): Promise<RenderedProductCard[]> => {
  return Promise.all(
    products.map(async (product) => ({
      ...product,
      image: await renderResponsiveImage(
        product.image,
        PRODUCT_CARD_IMAGE_OPTIONS,
      ),
    })),
  )
}

export const prepareProductKinds = async (
  kinds: ProductKind[],
): Promise<RenderedProductKind[]> => {
  return Promise.all(
    kinds.map(async (kind) => ({
      ...kind,
      image: kind.image
        ? await renderResponsiveImage(kind.image, PRODUCT_DETAIL_IMAGE_OPTIONS)
        : undefined,
    })),
  )
}

export const prepareProductGalleryImages = async (
  images: Product['images'],
): Promise<ProductGalleryImage[]> => {
  return Promise.all(
    images.map(async (image) => ({
      thumbnail: await renderSizedImage(
        image,
        PRODUCT_THUMBNAIL_IMAGE_OPTIONS,
      ),
      full: await renderResponsiveImage(image, PRODUCT_DETAIL_IMAGE_OPTIONS),
    })),
  )
}
