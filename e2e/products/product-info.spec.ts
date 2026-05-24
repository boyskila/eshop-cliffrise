import { test, expect } from '@playwright/test'

// Chunky Chalk (id=1) - no kind options
const PRODUCT_URL = '/en/products/1/'

test.describe('Product Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCT_URL)
  })

  test('displays the product name', async ({ page }) => {
    const heading = page.locator('[data-product-container] h1')
    await expect(heading).toHaveText('Chunky Chalk – 250 g')
  })

  test('displays the product description', async ({ page }) => {
    const container = page.locator('[data-product-container]')
    await expect(container).toContainText(
      'Chunky climbing chalk with a coarse structure that breaks down easily and provides reliable friction. Made for bouldering, sport routes and long climbing sessions. Open. Crush. Climb.',
    )
  })

  test('product name is rendered as an h1 heading', async ({ page }) => {
    const heading = page.locator('[data-product-container] h1')
    await expect(heading).toBeVisible()
  })

  test('displays the product price', async ({ page }) => {
    const container = page.locator('[data-product-container]')
    await expect(container).toContainText('12.99')
  })

  test('displays the free delivery banner', async ({ page }) => {
    const banner = page.locator('[data-product-free-delivery-banner]')

    await expect(banner).toBeVisible()
    await expect(banner).toContainText('Free Delivery over')
    await expect(banner).toContainText('€15.00')
  })

  test('add to cart button is visible and enabled for products without kind', async ({
    page,
  }) => {
    const addToCart = page.locator('[data-add-to-cart-button]')
    await expect(addToCart).toBeVisible()
    await expect(addToCart).toBeEnabled()
  })

  test('coming soon banner is shown on out-of-stock product image', async ({
    page,
  }) => {
    await page.goto('/en/products/3/')

    const banner = page.locator('[data-product-stock-banner]')
    await expect(banner).toBeVisible()
    await expect(banner).toHaveText('Coming soon')
  })

  test('coming soon banner is hidden for in-stock product image', async ({
    page,
  }) => {
    await expect(page.locator('[data-product-stock-banner]')).toHaveCount(0)
  })
})
