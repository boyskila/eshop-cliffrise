// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import node from '@astrojs/node'
import { DEFAULT_LANG } from './src/constants'
import solidJs from '@astrojs/solid-js'

export default defineConfig({
  site: 'https://eshop-cliffrise-test.up.railway.app',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: DEFAULT_LANG,
    locales: ['en', 'bg'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [solidJs()],
  security: {
    allowedDomains: [
      { protocol: 'http', hostname: 'localhost', port: '4321' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4321' },
      {
        protocol: 'https',
        hostname: 'eshop-cliffrise-test.up.railway.app',
      },
      {
        protocol: 'http',
        hostname: 'eshop-cliffrise-test.up.railway.app',
      },
      {
        protocol: 'https',
        hostname: 'eshop-cliffrise-test.up.railway.app',
        port: '443',
      },
      { protocol: 'https', hostname: process.env.RAILWAY_PUBLIC_DOMAIN },
      { protocol: 'https', hostname: '0.0.0.0' },
      { protocol: 'https', hostname: '*.up.railway.app' },
      { protocol: 'http', hostname: 'localhost', port: '8080' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8080' },
      { protocol: 'http', hostname: '10.179.135.236', port: '8080' },

      // IPv6 ULA range (fd00::/8) - where your [fd12:...] address comes from
      {
        protocol: 'http',
        hostname: '[fd00::]',
        port: process.env.PORT || '8080',
      },

      // Common local addresses in production (Railway uses these)
      {
        protocol: 'http',
        hostname: '0.0.0.0',
        port: process.env.PORT || '8080',
      },
      { protocol: 'http', hostname: '[::1]', port: process.env.PORT || '8080' },
    ],
  },
})
