import { test, expect } from '@playwright/test'

const TSHIRT_URL = '/en/products/4/'
const BEANIE_URL = '/en/products/5/'
const OUT_OF_STOCK_WITH_KIND_URL = '/en/products/6/'

test.describe('Kind Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TSHIRT_URL)
  })

  test('no kind option is selected by default', async ({ page }) => {
    const kindOptions = page.locator('[data-kind-option]')
    const count = await kindOptions.count()

    for (let i = 0; i < count; i++) {
      await expect(kindOptions.nth(i)).toHaveAttribute('aria-pressed', 'false')
    }
  })

  test('add to cart button is disabled by default for products with kind', async ({
    page,
  }) => {
    const addToCart = page.locator('[data-add-to-cart-button]')
    await expect(addToCart).toBeDisabled()
  })

  test('clicking a kind option selects it and deselects others', async ({
    page,
  }) => {
    const kindOptions = page.locator('[data-kind-option]')

    await kindOptions.first().click()
    await expect(kindOptions.first()).toHaveAttribute('aria-pressed', 'true')

    await kindOptions.last().click()
    await expect(kindOptions.last()).toHaveAttribute('aria-pressed', 'true')
    await expect(kindOptions.first()).toHaveAttribute('aria-pressed', 'false')
  })

  test('clicking a kind option enables add to cart button', async ({
    page,
  }) => {
    const kindOptions = page.locator('[data-kind-option]')
    const addToCart = page.locator('[data-add-to-cart-button]')

    await kindOptions.first().click()
    await expect(addToCart).toBeEnabled()
  })

  test('clicking a kind option keeps buttons disabled when product is out of stock', async ({
    page,
  }) => {
    await page.goto(OUT_OF_STOCK_WITH_KIND_URL)

    const kindOptions = page.locator('[data-kind-option]')
    const addToCart = page.locator('[data-add-to-cart-button]')

    await expect(kindOptions.first()).toBeDisabled()
    await kindOptions.first().click({ force: true })

    await expect(addToCart).toBeDisabled()
  })

  test('kind options are disabled when product is out of stock', async ({
    page,
  }) => {
    await page.goto(OUT_OF_STOCK_WITH_KIND_URL)

    const kindOptions = page.locator('[data-kind-option]')
    const count = await kindOptions.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      await expect(kindOptions.nth(i)).toBeDisabled()
      await expect(kindOptions.nth(i)).toHaveAttribute('aria-pressed', 'false')
    }

    await kindOptions.first().click({ force: true })
    await expect(kindOptions.first()).toHaveAttribute('aria-pressed', 'false')
  })

  test('switching kind options updates the selection', async ({ page }) => {
    const kindOptions = page.locator('[data-kind-option]')

    await kindOptions.first().click()
    await expect(kindOptions.first()).toHaveAttribute('aria-pressed', 'true')

    await kindOptions.nth(2).click()
    await expect(kindOptions.nth(2)).toHaveAttribute('aria-pressed', 'true')
    await expect(kindOptions.first()).toHaveAttribute('aria-pressed', 'false')
  })

  test('selecting a kind with an image updates the product image', async ({
    page,
  }) => {
    await page.goto(BEANIE_URL)

    const kindOptions = page.locator('[data-kind-option]')
    const productImage = page.locator('[data-product-image]')

    await kindOptions.first().click()

    const expectedImage = await kindOptions
      .first()
      .getAttribute('data-kind-image')
    await expect(productImage).toHaveAttribute('src', expectedImage!)
  })

  test('each kind option can be selected individually', async ({ page }) => {
    const kindOptions = page.locator('[data-kind-option]')
    const count = await kindOptions.count()

    for (let i = 0; i < count; i++) {
      await kindOptions.nth(i).click()
      await expect(kindOptions.nth(i)).toHaveAttribute('aria-pressed', 'true')

      for (let j = 0; j < count; j++) {
        if (j !== i) {
          await expect(kindOptions.nth(j)).toHaveAttribute(
            'aria-pressed',
            'false',
          )
        }
      }
    }
  })
})

test.describe('Kind Selector - AbortController cleanup', () => {
  test('listeners work correctly after navigation', async ({ page }) => {
    await page.goto(TSHIRT_URL)

    const kindOptions = page.locator('[data-kind-option]')
    await kindOptions.nth(1).click()
    await expect(kindOptions.nth(1)).toHaveAttribute('aria-pressed', 'true')

    // Navigate away and back
    await page.goto('/bg/')
    await page.goto(TSHIRT_URL)

    const kindOptions2 = page.locator('[data-kind-option]')
    const addToCart = page.locator('[data-add-to-cart-button]')

    const count = await kindOptions2.count()
    for (let i = 0; i < count; i++) {
      await expect(kindOptions2.nth(i)).toHaveAttribute('aria-pressed', 'false')
    }
    await expect(addToCart).toBeDisabled()

    await kindOptions2.first().click()
    await expect(kindOptions2.first()).toHaveAttribute('aria-pressed', 'true')
    await expect(addToCart).toBeEnabled()
  })
})
