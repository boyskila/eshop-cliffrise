import { z } from 'astro/zod'
import type Stripe from 'stripe'
import type {
  Locale,
  ProductCatalogMetadata,
  ProductLocaleMetadata,
} from '@types'

const productLocaleKindMetadataSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1).optional(),
  inStock: z.boolean().optional(),
})

const productLocaleMetadataSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  kind: z.array(productLocaleKindMetadataSchema).default([]),
  kindTitle: z.string().optional(),
  inStock: z.boolean().optional(),
  productPageTitle: z.string().optional(),
})

const stripeProductMetadataSchema = z.object({
  images: z.string().min(2),
  'image-folder': z.string(),
  'main-image': z.string().min(1),
  weight: z.coerce.number().positive(),
  slug: z.string().min(1),
})

const productImageListSchema = z.array(z.string().min(1))

const parseJsonValue = <T>(
  raw: string,
  schema: z.ZodSchema<T>,
  label: string,
): T => {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error(`${label} is not valid JSON`, { cause: error })
  }

  const result = schema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`${label} has an invalid shape`, { cause: result.error })
  }

  return result.data
}

export const parseProductLocaleMetadata = (
  metadata: Stripe.Metadata,
  lang: Locale,
): ProductLocaleMetadata => {
  const rawMetadata = metadata[lang]
  if (!rawMetadata) {
    throw new Error(`Missing localized product metadata for "${lang}"`)
  }

  const parsed = parseJsonValue(
    rawMetadata,
    productLocaleMetadataSchema,
    `Product metadata for locale "${lang}"`,
  )

  return {
    ...parsed,
    kind: parsed.kind ?? [],
  }
}

export const parseProductCatalogMetadata = (
  metadata: Stripe.Metadata,
): ProductCatalogMetadata => {
  const result = stripeProductMetadataSchema.safeParse(metadata)
  if (!result.success) {
    throw new Error('Product catalog metadata is invalid', {
      cause: result.error,
    })
  }

  const parsed = result.data

  return {
    images: parseJsonValue(
      parsed.images,
      productImageListSchema,
      'Product images',
    ),
    imageFolder: parsed['image-folder'],
    mainImage: parsed['main-image'],
    weight: parsed.weight,
    slug: parsed.slug,
  }
}
