import type { Locale } from '@types'

export type SchemaNode = Record<string, unknown>

type SEOImage = {
  src: string
  alt: string
}

const SOCIAL_PROFILES = [
  'https://www.facebook.com/profile.php?id=61574708947472',
  'https://www.instagram.com/_cliffrise/',
]

const isSchemaNode = (item: unknown): item is SchemaNode =>
  Boolean(item) && typeof item === 'object' && !Array.isArray(item)

export const getSchemaLanguage = (lang: Locale) =>
  lang === 'bg' ? 'bg-BG' : 'en-US'

export const ensureTrailingSlash = (url: string | URL) => {
  const value = url.toString()
  const hashIndex = value.indexOf('#')
  const urlWithoutHash = hashIndex === -1 ? value : value.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : value.slice(hashIndex)

  return `${urlWithoutHash.replace(/\/$/, '')}/${hash}`
}

export const getOrganizationId = (baseUrl: string | URL) =>
  new URL('/', baseUrl).href

export const getLogoId = (baseUrl: string | URL) =>
  new URL('/logos/cliffrise.svg', baseUrl).href

export const getWebPageId = (url: string | URL) => ensureTrailingSlash(url)

export const getProductId = (url: string | URL) =>
  `${ensureTrailingSlash(url)}#product`

export const normalizeSchemaNodes = (
  jsonLd: unknown | unknown[] | undefined,
): SchemaNode[] => {
  const items = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []
  const nodes: SchemaNode[] = []

  for (const item of items) {
    if (!isSchemaNode(item)) {
      continue
    }

    if (Array.isArray(item['@graph'])) {
      nodes.push(...normalizeSchemaNodes(item['@graph']))
      continue
    }

    const node = { ...item }
    delete node['@context']
    nodes.push(node)
  }

  return nodes
}

export const buildSchemaDocument = (nodes: SchemaNode[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes,
})

export const buildBaseSchemaGraph = ({
  baseUrl,
  lang,
  websiteDescription,
  pageTitle,
  pageDescription,
  canonicalURL,
  image,
}: {
  baseUrl: string | URL
  lang: Locale
  websiteDescription: string
  pageTitle: string
  pageDescription: string
  canonicalURL: string | URL
  image?: SEOImage
}): SchemaNode[] => {
  const rootUrl = new URL('/', baseUrl).href
  const aboutUrl = new URL(`/${lang}/#about-us`, baseUrl).href
  const contactUrl = new URL(`/${lang}/#contact-us`, baseUrl).href
  const logoUrl = new URL('/logos/cliffrise.svg', baseUrl).href
  const imageUrl = image ? new URL(image.src, baseUrl).href : undefined
  const organizationId = getOrganizationId(baseUrl)
  const logoId = getLogoId(baseUrl)
  const inLanguage = getSchemaLanguage(lang)
  const publisher = {
    '@type': 'Organization',
    name: 'CliffRise',
    url: rootUrl,
  }

  return [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'CliffRise',
      alternateName: ['CliffRise Shop'],
      legalName: 'SOLUTION 83 EOOD',
      url: rootUrl,
      logo: {
        '@type': 'ImageObject',
        '@id': logoId,
        url: logoUrl,
        contentUrl: logoUrl,
        caption: 'CliffRise',
      },
      image: {
        '@id': logoId,
      },
      email: 'rise@cliffrise.com',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'rise@cliffrise.com',
        url: contactUrl,
        availableLanguage: ['Bulgarian', 'English'],
        areaServed: {
          '@type': 'Country',
          name: 'Bulgaria',
        },
      },
      founder: [
        {
          '@type': 'Person',
          name: 'Boyko Lalov',
          url: new URL(`/${lang}/people/boyko-lalov/`, baseUrl).href,
        },
        {
          '@type': 'Person',
          name: 'Alex Ianev',
          url: new URL(`/${lang}/people/alex-ianev/`, baseUrl).href,
        },
      ],
      knowsAbout: [
        {
          '@type': 'Thing',
          name: 'rock climbing',
        },
        {
          '@type': 'Thing',
          name: 'climbing chalk',
        },
        {
          '@type': 'Thing',
          name: 'climbing route development',
        },
      ],
      sameAs: SOCIAL_PROFILES,
    },
    {
      '@type': 'WebSite',
      name: 'CliffRise Shop',
      alternateName: [
        'CliffRise',
        'CliffRise - Climbing Products with a Mission',
      ],
      url: rootUrl,
      inLanguage,
      description: websiteDescription,
      publisher,
    },
    {
      '@type': 'WebPage',
      '@id': getWebPageId(canonicalURL),
      url: ensureTrailingSlash(canonicalURL),
      name: pageTitle,
      description: pageDescription,
      inLanguage,
      isPartOf: {
        '@type': 'WebSite',
        name: 'CliffRise Shop',
        url: rootUrl,
      },
      about: {
        '@id': aboutUrl,
      },
      publisher,
      ...(imageUrl
        ? {
            primaryImageOfPage: {
              '@type': 'ImageObject',
              url: imageUrl,
              caption: image?.alt,
            },
          }
        : {}),
    },
  ]
}
