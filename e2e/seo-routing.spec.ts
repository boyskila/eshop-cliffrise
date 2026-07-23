import { expect, test, type APIRequestContext } from '@playwright/test'
import {
  getLocalizedAlternates,
  getLocalizedProductUrls,
} from '../src/utils/siteUrls'

const canonicalOrigin = 'https://cliffrise.com'

type SeoLinks = {
  canonical: string
  alternates: Record<string, string>
  robots: string
}

const getSeoLinks = async (
  request: APIRequestContext,
  pathname: string,
): Promise<SeoLinks> => {
  const response = await request.get(pathname, { maxRedirects: 0 })
  expect(response.status()).toBe(200)

  const html = await response.text()
  const canonical = html.match(
    /<link rel="canonical" href="([^"]+)"\s*\/?>/,
  )?.[1]
  const robots = html.match(/<meta name="robots" content="([^"]+)"\s*\/?>/)?.[1]
  const alternates = Object.fromEntries(
    [
      ...html.matchAll(
        /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\s*\/?>/g,
      ),
    ].map((match) => [match[1], match[2]]),
  )

  expect(canonical).toBeTruthy()
  expect(robots).toBeTruthy()

  return {
    canonical: canonical!,
    alternates,
    robots: robots!,
  }
}

test.describe('Localized SEO routing', () => {
  test('builds alternates safely for unprefixed and partial-locale routes', () => {
    const unprefixedAlternates = getLocalizedAlternates('/privacy-policy/')
    const bulgarianOnlyAlternates = getLocalizedAlternates(
      '/bg/privacy-policy/',
      ['bg'],
    )

    expect(
      Object.fromEntries(
        unprefixedAlternates.map(({ lang, href }) => [lang, href.href]),
      ),
    ).toEqual({
      en: `${canonicalOrigin}/en/privacy-policy/`,
      bg: `${canonicalOrigin}/bg/privacy-policy/`,
      'x-default': `${canonicalOrigin}/en/privacy-policy/`,
    })
    expect(
      Object.fromEntries(
        bulgarianOnlyAlternates.map(({ lang, href }) => [lang, href.href]),
      ),
    ).toEqual({
      bg: `${canonicalOrigin}/bg/privacy-policy/`,
      'x-default': `${canonicalOrigin}/bg/privacy-policy/`,
    })
  })

  test('builds unique localized product sitemap URLs', () => {
    expect(getLocalizedProductUrls(['chalk', 'chalk', 'tape'])).toEqual([
      `${canonicalOrigin}/en/products/chalk/`,
      `${canonicalOrigin}/bg/products/chalk/`,
      `${canonicalOrigin}/en/products/tape/`,
      `${canonicalOrigin}/bg/products/tape/`,
    ])
  })

  test('English homepage self-canonicalizes with reciprocal alternates', async ({
    request,
  }) => {
    const seoLinks = await getSeoLinks(request, '/en/')

    expect(seoLinks.canonical).toBe(`${canonicalOrigin}/en/`)
    expect(seoLinks.alternates).toEqual({
      en: `${canonicalOrigin}/en/`,
      bg: `${canonicalOrigin}/bg/`,
      'x-default': `${canonicalOrigin}/`,
    })
    expect(seoLinks.robots).toBe('index,follow')
  })

  test('Bulgarian homepage self-canonicalizes with reciprocal alternates', async ({
    request,
  }) => {
    const seoLinks = await getSeoLinks(request, '/bg/')

    expect(seoLinks.canonical).toBe(`${canonicalOrigin}/bg/`)
    expect(seoLinks.alternates).toEqual({
      en: `${canonicalOrigin}/en/`,
      bg: `${canonicalOrigin}/bg/`,
      'x-default': `${canonicalOrigin}/`,
    })
  })

  test('localized products use exact canonicals and English x-default', async ({
    request,
  }) => {
    const englishSeoLinks = await getSeoLinks(request, '/en/products/1/')
    const bulgarianSeoLinks = await getSeoLinks(request, '/bg/products/1/')
    const expectedAlternates = {
      en: `${canonicalOrigin}/en/products/1/`,
      bg: `${canonicalOrigin}/bg/products/1/`,
      'x-default': `${canonicalOrigin}/en/products/1/`,
    }

    expect(englishSeoLinks.canonical).toBe(expectedAlternates.en)
    expect(bulgarianSeoLinks.canonical).toBe(expectedAlternates.bg)
    expect(englishSeoLinks.alternates).toEqual(expectedAlternates)
    expect(bulgarianSeoLinks.alternates).toEqual(expectedAlternates)
  })

  test('sitemap contains only canonical localized hosts and excludes root', async ({
    request,
  }) => {
    const indexResponse = await request.get('/sitemap-index.xml')
    expect(indexResponse.status()).toBe(200)

    const sitemapIndex = await indexResponse.text()
    expect(sitemapIndex).toContain(
      `<loc>${canonicalOrigin}/sitemap-0.xml</loc>`,
    )
    expect(sitemapIndex).not.toContain('www.cliffrise.com')

    const response = await request.get('/sitemap-0.xml')
    expect(response.status()).toBe(200)

    const sitemap = await response.text()
    expect(sitemap).toContain(`<loc>${canonicalOrigin}/en/</loc>`)
    expect(sitemap).toContain(`<loc>${canonicalOrigin}/bg/</loc>`)
    expect(sitemap).not.toContain(`<loc>${canonicalOrigin}/</loc>`)
    expect(sitemap).not.toContain('www.cliffrise.com')
    expect(sitemap).not.toContain('/checkout/')
    expect(sitemap).not.toContain('/api/')
    expect(sitemap).not.toContain('/_actions/')
  })

  test('robots references the canonical sitemap index', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)

    const robots = await response.text()
    expect(robots).toContain(`Sitemap: ${canonicalOrigin}/sitemap-index.xml`)
    expect(robots).not.toContain('www.cliffrise.com')
  })
})
