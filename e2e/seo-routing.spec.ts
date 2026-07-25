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

  test('product category pages use localized canonicals and alternates', async ({
    request,
  }) => {
    const englishSeoLinks = await getSeoLinks(request, '/en/products/')
    const bulgarianSeoLinks = await getSeoLinks(request, '/bg/products/')
    const expectedAlternates = {
      en: `${canonicalOrigin}/en/products/`,
      bg: `${canonicalOrigin}/bg/products/`,
      'x-default': `${canonicalOrigin}/en/products/`,
    }

    expect(englishSeoLinks.canonical).toBe(expectedAlternates.en)
    expect(bulgarianSeoLinks.canonical).toBe(expectedAlternates.bg)
    expect(englishSeoLinks.alternates).toEqual(expectedAlternates)
    expect(bulgarianSeoLinks.alternates).toEqual(expectedAlternates)
  })

  test('product category page renders a product list without a carousel', async ({
    page,
  }) => {
    await page.goto('/en/products/')

    await expect(page.locator('[data-products-list]')).toBeVisible()
    await expect(
      page.locator('[data-products-list] [data-product-card-image]'),
    ).not.toHaveCount(0)
    await expect(page.locator('[data-products-carousel]')).toHaveCount(0)
  })

  test('unknown products return a noindex 404 page', async ({ request }) => {
    const response = await request.get('/en/products/not-a-real-product/', {
      maxRedirects: 0,
    })
    const html = await response.text()

    expect(response.status()).toBe(404)
    expect(response.headers().location).toBeUndefined()
    expect(html).toContain('Product not found')
    expect(html).toContain('content="noindex,follow"')
    expect(html).toContain('href="/en/products/"')
  })

  test('unknown localized routes return a generic localized 404 page', async ({
    request,
  }) => {
    const englishResponse = await request.get('/en/not-a-real-page/', {
      maxRedirects: 0,
    })
    const bulgarianResponse = await request.get('/bg/not-a-real-page/', {
      maxRedirects: 0,
    })
    const englishHtml = await englishResponse.text()
    const bulgarianHtml = await bulgarianResponse.text()

    expect(englishResponse.status()).toBe(404)
    expect(englishHtml).toContain('Page not found')
    expect(englishHtml).toContain('href="/en/"')
    expect(englishHtml).toContain('content="noindex,follow"')

    expect(bulgarianResponse.status()).toBe(404)
    expect(bulgarianHtml).toContain('Страницата не е намерена')
    expect(bulgarianHtml).toContain('href="/bg/"')
    expect(bulgarianHtml).toContain('content="noindex,follow"')
  })

  test('indexable page templates render one h1', async ({ request }) => {
    const paths = [
      '/en/',
      '/en/products/',
      '/en/products/1/',
      '/en/people/boyko-lalov/',
      '/en/privacy-policy/',
    ]

    for (const path of paths) {
      const response = await request.get(path)
      const html = await response.text()
      const h1Count = html.match(/<h1(?:\s|>)/g)?.length ?? 0

      expect(response.ok(), `${path} should return a successful response`).toBe(
        true,
      )
      expect(h1Count, `${path} should render exactly one h1`).toBe(1)
    }
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
    expect(sitemap).toContain(`<loc>${canonicalOrigin}/en/products/</loc>`)
    expect(sitemap).toContain(`<loc>${canonicalOrigin}/bg/products/</loc>`)
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
