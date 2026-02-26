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
    // Keep strict origin checks in production, but skip them in e2e to avoid false 403s on action POSTs.
    checkOrigin:
      process.env.NODE_ENV === 'production' && process.env.E2E !== 'true',
    // Trust local forwarded hosts used in preview/e2e so Astro resolves request origin consistently.
    allowedDomains: [
      { protocol: 'http', hostname: 'localhost', port: '4321' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4321' },
    ],
  },
  server: {
    allowedHosts: ['localhost', '127.0.0.1'],
  },
})
