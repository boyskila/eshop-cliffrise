import { expect, test, type APIRequestContext } from '@playwright/test'

const getRedirectPath = async (
  request: APIRequestContext,
  path: string,
  country?: string,
) => {
  const response = await request.get(path, {
    headers: country ? { 'cf-ipcountry': country } : undefined,
    maxRedirects: 0,
  })

  expect(response.status()).toBe(302)

  const location = response.headers().location
  expect(location).toBeTruthy()

  return new URL(location!).pathname
}

test.describe('Locale middleware', () => {
  test('redirects root to Bulgarian when Cloudflare country is missing', async ({
    request,
  }) => {
    await expect(getRedirectPath(request, '/')).resolves.toBe('/bg/')
  })

  test('redirects root to Bulgarian for Bulgarian visitors', async ({
    request,
  }) => {
    await expect(getRedirectPath(request, '/', 'BG')).resolves.toBe('/bg/')
  })

  test('redirects root to English for visitors outside Bulgaria', async ({
    request,
  }) => {
    await expect(getRedirectPath(request, '/', 'US')).resolves.toBe('/en/')
  })

  test('preserves the requested path when redirecting to English', async ({
    request,
  }) => {
    await expect(
      getRedirectPath(request, '/products/example/', 'US'),
    ).resolves.toBe('/en/products/example/')
  })

  test('does not redirect explicit locale paths', async ({ request }) => {
    const response = await request.get('/en/', {
      headers: { 'cf-ipcountry': 'BG' },
      maxRedirects: 0,
    })

    expect(response.status()).toBe(200)
  })

  test('does not redirect static assets', async ({ request }) => {
    const response = await request.get('/favicon.ico', {
      headers: { 'cf-ipcountry': 'US' },
      maxRedirects: 0,
    })

    expect(response.status()).toBe(200)
  })
})
