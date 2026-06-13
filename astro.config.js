import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import node from '@astrojs/node'
import { DEFAULT_LANG, SUPPORTED_LANGS } from './src/constants'
import solidJs from '@astrojs/solid-js'

const siteUrl = new URL(process.env.SITE_URL || 'http://localhost:4321')
const sessionTtlSeconds = 60 * 60 * 24 * 30

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
  integrations: [solidJs()],
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
