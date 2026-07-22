import { expect, test, type Page } from '@playwright/test'

const consentKey = 'cliffrise_cookie_consent'
const googleAnalyticsUrl = /https:\/\/www\.googletagmanager\.com\/.*/

const waitForCartRestore = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/_actions/getCart/'),
  )

const gotoAndWaitForCart = async (page: Page, url: string) => {
  await Promise.all([waitForCartRestore(page), page.goto(url)])
}

const reloadAndWaitForCart = async (page: Page) => {
  await Promise.all([waitForCartRestore(page), page.reload()])
}

const mockGoogleAnalytics = async (page: Page) => {
  const requests: string[] = []

  await page.route(googleAnalyticsUrl, async (route) => {
    requests.push(route.request().url())
    await route.fulfill({
      contentType: 'application/javascript',
      body: '',
    })
  })

  return requests
}

const grantStoredConsent = async (page: Page) => {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value)
    },
    [consentKey, 'granted'],
  )
}

test('does not load Google Analytics before consent', async ({ page }) => {
  const analyticsRequests = await mockGoogleAnalytics(page)

  await gotoAndWaitForCart(page, '/en/')

  await expect(page.locator('#google-analytics-script')).toHaveCount(0)
  expect(analyticsRequests).toHaveLength(0)
})

test('loads Google Analytics once after consent and after each reload', async ({
  page,
}) => {
  const analyticsRequests = await mockGoogleAnalytics(page)
  await grantStoredConsent(page)

  await gotoAndWaitForCart(page, '/en/')
  await expect(page.locator('#google-analytics-script')).toHaveCount(1)

  const getConfigCommands = () =>
    page.evaluate(() =>
      window.dataLayer?.filter(
        (entry) => Array.isArray(entry) && entry[0] === 'config',
      ),
    )

  const initialConfigCommands = await getConfigCommands()
  expect(initialConfigCommands).toHaveLength(1)
  expect(initialConfigCommands?.[0]?.[1]).toBe('G-TEST')
  await expect.poll(() => analyticsRequests.length).toBe(1)

  await reloadAndWaitForCart(page)
  await expect(page.locator('#google-analytics-script')).toHaveCount(1)

  const reloadedConfigCommands = await getConfigCommands()
  expect(reloadedConfigCommands).toHaveLength(1)
  await expect.poll(() => analyticsRequests.length).toBe(2)
})

test('persists accepted consent across full-page reloads', async ({ page }) => {
  await mockGoogleAnalytics(page)
  await gotoAndWaitForCart(page, '/en/')

  const cookieBanner = page.locator('[data-cookie-banner]')
  await expect(cookieBanner).toBeVisible()
  await page.locator('[data-accept-cookies]').click()

  await expect(cookieBanner).toBeHidden()
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), consentKey))
    .toBe('granted')

  await reloadAndWaitForCart(page)
  await expect(cookieBanner).toBeHidden()
})

test('applies consent to the current page when storage is unavailable', async ({
  page,
}) => {
  await page.addInitScript((key) => {
    const originalSetItem = Storage.prototype.setItem

    Storage.prototype.setItem = (storageKey, value) => {
      if (storageKey === key) {
        throw new DOMException('Storage is unavailable')
      }

      originalSetItem.call(window.localStorage, storageKey, value)
    }
  }, consentKey)
  await mockGoogleAnalytics(page)
  await gotoAndWaitForCart(page, '/en/')

  const cookieBanner = page.locator('[data-cookie-banner]')
  await page.locator('[data-accept-cookies]').click()

  await expect(cookieBanner).toBeHidden()
  await expect(page.locator('#google-analytics-script')).toHaveCount(1)
  expect(
    await page.evaluate((key) => localStorage.getItem(key), consentKey),
  ).toBe(null)

  await reloadAndWaitForCart(page)
  await expect(cookieBanner).toBeVisible()
})
