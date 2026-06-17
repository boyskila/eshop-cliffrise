import type { APIContext } from 'astro'

export const prerender = false

const getSiteUrl = (site: URL | undefined) =>
  site ?? new URL(process.env.SITE_URL || 'https://www.cliffrise.com')

export function GET({ site }: APIContext) {
  const siteUrl = getSiteUrl(site)
  const sitemapUrl = new URL('/sitemap-index.xml', siteUrl)
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /en/checkout',
    'Disallow: /bg/checkout',
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
