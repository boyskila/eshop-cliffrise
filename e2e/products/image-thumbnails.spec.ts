import { test, expect } from '@playwright/test'

const PRODUCT_URL = '/en/products/1/'

test.describe('Image Thumbnails', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCT_URL)
  })

  test('clicking a thumbnail updates the main product image', async ({
    page,
  }) => {
    const mainImage = page.locator('#product-main-image')
    const thumbnails = page.locator('[data-product-thumbnail]')

    const count = await thumbnails.count()
    if (count < 2) return

    const expectedSrc = await thumbnails.nth(1).getAttribute('data-image-src')
    await thumbnails.nth(1).click()
    await expect(mainImage).toHaveAttribute('src', expectedSrc!)
  })

  test('clicking the same thumbnail keeps the image unchanged', async ({
    page,
  }) => {
    const mainImage = page.locator('#product-main-image')
    const thumbnails = page.locator('[data-product-thumbnail]')

    await thumbnails.first().click()
    const src = await thumbnails.first().getAttribute('data-image-src')
    await expect(mainImage).toHaveAttribute('src', src!)

    await thumbnails.first().click()
    await expect(mainImage).toHaveAttribute('src', src!)
  })

  test('each thumbnail click updates the main image to match', async ({
    page,
  }) => {
    const mainImage = page.locator('#product-main-image')
    const thumbnails = page.locator('[data-product-thumbnail]')
    const count = await thumbnails.count()

    for (let i = 0; i < count; i++) {
      await thumbnails.nth(i).click()
      const expectedSrc = await thumbnails.nth(i).getAttribute('data-image-src')
      await expect(mainImage).toHaveAttribute('src', expectedSrc!)
    }
  })
})

test.describe('Image Thumbnails - AbortController cleanup', () => {
  test('listeners work correctly after client-side navigation', async ({
    page,
  }) => {
    await page.goto(PRODUCT_URL)

    const thumbnails = page.locator('[data-product-thumbnail]')
    const count = await thumbnails.count()
    if (count < 2) return

    await thumbnails.last().click()

    // Navigate away and back
    await page.goto('/bg/')
    await page.goto(PRODUCT_URL)

    const mainImage = page.locator('#product-main-image')
    const thumbnails2 = page.locator('[data-product-thumbnail]')

    const expectedSrc = await thumbnails2.last().getAttribute('data-image-src')
    await thumbnails2.last().click()
    await expect(mainImage).toHaveAttribute('src', expectedSrc!)
  })
})
