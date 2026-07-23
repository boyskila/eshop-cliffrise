import { expect, test, type APIRequestContext } from '@playwright/test'

const getRedirectUrl = async (
  request: APIRequestContext,
  path: string,
  country?: string,
) => {
  const response = await request.get(path, {
    headers: country ? { 'cf-ipcountry': country } : undefined,
    maxRedirects: 0,
  })

  expect(response.status()).toBe(307)
  expect(response.headers()['cache-control']).toBe('no-store')
  expect(response.headers().vary).toContain('CF-IPCountry')

  const location = response.headers().location
  expect(location).toBeTruthy()

  return new URL(location!)
}

test.describe('Locale redirect', () => {
  test('redirects root to English when Cloudflare country is missing', async ({
    request,
  }) => {
    const redirectUrl = await getRedirectUrl(request, '/')

    expect(redirectUrl.pathname).toBe('/en/')
  })

  test('redirects root to Bulgarian for Bulgarian visitors', async ({
    request,
  }) => {
    const redirectUrl = await getRedirectUrl(request, '/', 'BG')

    expect(redirectUrl.pathname).toBe('/bg/')
  })

  test('redirects root to English for visitors outside Bulgaria', async ({
    request,
  }) => {
    const redirectUrl = await getRedirectUrl(request, '/', 'US')

    expect(redirectUrl.pathname).toBe('/en/')
  })

  test('redirects unknown country codes to English', async ({ request }) => {
    const redirectUrl = await getRedirectUrl(request, '/', 'XX')

    expect(redirectUrl.pathname).toBe('/en/')
  })

  test('preserves query parameters', async ({ request }) => {
    const redirectUrl = await getRedirectUrl(
      request,
      '/?utm_source=search&campaign=summer',
      'US',
    )

    expect(redirectUrl.pathname).toBe('/en/')
    expect(redirectUrl.search).toBe('?utm_source=search&campaign=summer')
  })

  test('does not redirect explicit locale paths or loop', async ({
    request,
  }) => {
    const response = await request.get('/en/', {
      headers: { 'cf-ipcountry': 'BG' },
      maxRedirects: 0,
    })

    expect(response.status()).toBe(200)
  })

  test('redirects unprefixed page paths using the detected locale', async ({
    request,
  }) => {
    const englishRedirectUrl = await getRedirectUrl(
      request,
      '/products/1/?ref=campaign',
      'US',
    )
    const bulgarianRedirectUrl = await getRedirectUrl(
      request,
      '/products/1/',
      'BG',
    )

    expect(englishRedirectUrl.pathname).toBe('/en/products/1/')
    expect(englishRedirectUrl.search).toBe('?ref=campaign')
    expect(bulgarianRedirectUrl.pathname).toBe('/bg/products/1/')
  })

  test('redirects routes containing dots when they are not static files', async ({
    request,
  }) => {
    const redirectUrl = await getRedirectUrl(
      request,
      '/products/chalk.v2/',
      'US',
    )

    expect(redirectUrl.pathname).toBe('/en/products/chalk.v2/')
  })

  test('does not locale-redirect API roots or static files', async ({
    request,
  }) => {
    const apiResponse = await request.get('/api', { maxRedirects: 0 })
    const faviconResponse = await request.get('/favicon.ico', {
      maxRedirects: 0,
    })

    expect(apiResponse.status()).not.toBe(307)
    expect(faviconResponse.status()).not.toBe(307)
  })
})
