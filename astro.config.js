import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import node from '@astrojs/node'
import { DEFAULT_LANG } from './src/constants'
import solidJs from '@astrojs/solid-js'

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
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
        hostname: process.env.SITE_URL?.replace(/^https?:\/\//, ''),
      },
    ],
  },
})
