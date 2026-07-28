import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import node from '@astrojs/node'
import { DEFAULT_LANG, SUPPORTED_LANGS } from './src/constants'
import solidJs from '@astrojs/solid-js'
import sitemap from '@astrojs/sitemap'
import { loadEnv } from 'vite'
import { getCanonicalSiteUrl, normalizeSiteUrl } from './src/utils/siteUrls'

const modeFlagIndex = process.argv.indexOf('--mode')
const mode =
  modeFlagIndex >= 0 ? process.argv[modeFlagIndex + 1] : process.env.NODE_ENV
const isPlaywrightTest = process.env.PLAYWRIGHT_TEST === 'true'
const resolvedMode = isPlaywrightTest ? 'test' : (mode ?? 'production')
const isTestMode = resolvedMode === 'test'
const outputDirectory = isTestMode ? './dist-playwright' : './dist'
const env = loadEnv(resolvedMode, process.cwd(), '')
const getEnv = (name) => process.env[name] ?? env[name]
const configuredSiteUrl = getEnv('SITE_URL')

if (!configuredSiteUrl && !isTestMode) {
  throw new Error('SITE_URL is required outside test mode')
}

const runtimeSiteUrl = normalizeSiteUrl(
  configuredSiteUrl ?? 'http://localhost:4321',
)
const canonicalSiteUrl = getCanonicalSiteUrl()
const sessionTtlSeconds = 60 * 60 * 24 * 30
const sitemapLocales = Object.fromEntries(
  SUPPORTED_LANGS.map((lang) => [lang, lang]),
)

const shouldIncludeSitemapPage = (page) => {
  const { pathname } = new URL(page)

  return (
    pathname !== '/' &&
    !pathname.includes('/checkout/') &&
    !pathname.includes('/api/') &&
    !pathname.startsWith('/_actions/') &&
    !pathname.includes('[') &&
    !pathname.includes(']')
  )
}

export default defineConfig({
  site: canonicalSiteUrl.href,
  outDir: outputDirectory,
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
        protocol: runtimeSiteUrl.protocol.replace(':', ''),
        hostname: runtimeSiteUrl.hostname,
        port: runtimeSiteUrl.port || undefined,
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
