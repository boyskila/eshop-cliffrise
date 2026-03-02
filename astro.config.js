// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import node from '@astrojs/node'
import { DEFAULT_LANG } from './src/constants'
import solidJs from '@astrojs/solid-js'

export default defineConfig({
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
    checkOrigin:
      process.env.NODE_ENV === 'production' && process.env.E2E !== 'true',
    allowedDomains: [
      {
        protocol: 'https',
        hostname:
          'https://eshop-cliffrise-eshop-cliffrise-test.up.railway.app/',
      },
      {
        protocol: 'https',
        hostname:
          'www.https://eshop-cliffrise-eshop-cliffrise-test.up.railway.app/',
      },
    ],
  },
  server: {
    host: process.env.NODE_ENV !== 'test',
  },
})
