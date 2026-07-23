import type { APIRoute } from 'astro'
import { getCanonicalSiteUrl } from '@utils/siteUrls'

export const prerender = false

export const GET: APIRoute = () => {
  const siteUrl = getCanonicalSiteUrl()
  const sitemapUrl = new URL('/sitemap-index.xml', siteUrl)
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /cart/',
    'Disallow: /en/cart/',
    'Disallow: /bg/cart/',
    'Disallow: /checkout/',
    'Disallow: /en/checkout/',
    'Disallow: /bg/checkout/',
    'Disallow: /success',
    'Disallow: /cancel',
    '',
    `Sitemap: ${sitemapUrl.href}`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
