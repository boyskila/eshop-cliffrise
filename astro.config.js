// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { DEFAULT_LANG } from './src/constants';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  i18n: {
    defaultLocale: DEFAULT_LANG,
    locales: ['en', 'bg'],
    routing: {
      prefixDefaultLocale: true,
    }
  }
});