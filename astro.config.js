import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import node from '@astrojs/node'
import { DEFAULT_LANG, SUPPORTED_LANGS } from './src/constants'
import solidJs from '@astrojs/solid-js'
import sitemap from '@astrojs/sitemap'
import Stripe from 'stripe'
import { loadEnv } from 'vite'

const modeFlagIndex = process.argv.indexOf('--mode')
const mode =
  modeFlagIndex >= 0 ? process.argv[modeFlagIndex + 1] : process.env.NODE_ENV
const env = loadEnv(mode || 'production', process.cwd(), '')
const getEnv = (name) => process.env[name] ?? env[name]
const siteUrl = new URL(getEnv('SITE_URL') || 'http://localhost:4321')
const sessionTtlSeconds = 60 * 60 * 24 * 30
const sitemapLocales = Object.fromEntries(
  SUPPORTED_LANGS.map((lang) => [lang, lang]),
)
const sitemapStaticPaths = [
  '/',
  '/privacy-policy/',
  '/terms-and-conditions/',
  '/gdpr/',
  '/people/boyko-lalov/',
  '/people/alex-ianev/',
]
const sitemapStaticPages = SUPPORTED_LANGS.flatMap((lang) =>
  sitemapStaticPaths.map((path) => new URL(`/${lang}${path}`, siteUrl).href),
)

const getSitemapProductPages = async () => {
  const stripeSecretKey = getEnv('STRIPE_SECRET_KEY')

  if (!stripeSecretKey) {
    return []
  }

  const stripe = new Stripe(stripeSecretKey)
  const productPages = []

  try {
    for await (const product of stripe.products.list({
      active: true,
      limit: 100,
    })) {
      const slug = product.metadata.slug

      if (!slug) {
        continue
      }

      for (const lang of SUPPORTED_LANGS) {
        productPages.push(new URL(`/${lang}/products/${slug}/`, siteUrl).href)
      }
    }
  } catch (error) {
    console.warn('Could not add Stripe product pages to sitemap', error)
  }

  return productPages
}

const sitemapCustomPages = [
  ...sitemapStaticPages,
  ...(await getSitemapProductPages()),
]

const shouldIncludeSitemapPage = (page) => {
  const { pathname } = new URL(page)

  return (
    pathname !== '/' &&
    pathname !== '/en/products/' &&
    pathname !== '/bg/products/' &&
    !pathname.includes('/checkout/') &&
    !pathname.includes('/api/') &&
    !pathname.includes('[') &&
    !pathname.includes(']')
  )
}

export default defineConfig({
  site: siteUrl.href,
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
      allowedHosts: ['rise.cliffrise.com'],
    },
  },
  i18n: {
    defaultLocale: DEFAULT_LANG,
    locales: [...SUPPORTED_LANGS],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  session: {
    driver: 'redis',
    options: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      base: 'cliffrise:sessions',
      ttl: sessionTtlSeconds,
      connectTimeout: 1000,
      maxRetriesPerRequest: 1,
    },
    ttl: sessionTtlSeconds,
  },
  integrations: [
    solidJs(),
    sitemap({
      customPages: sitemapCustomPages,
      filter: shouldIncludeSitemapPage,
      i18n: {
        defaultLocale: DEFAULT_LANG,
        locales: sitemapLocales,
      },
    }),
  ],
  security: {
    allowedDomains: [
      { protocol: 'http', hostname: 'localhost', port: '4321' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4321' },
      {
        protocol: siteUrl.protocol.replace(':', ''),
        hostname: siteUrl.hostname,
        port: siteUrl.port || undefined,
      },
      {
        protocol: 'https',
        hostname: 'cliffrise.com',
      },
      {
        protocol: 'https',
        hostname: 'www.cliffrise.com',
      },
    ],
  },
})
