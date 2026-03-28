import { test, expect } from '@playwright/test'

test.describe('Products Carousel - Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('each product image links to its product page', async ({ page }) => {
    const carousel = page.locator('#products')
    const imageLinks = carousel.locator('a:has(img[loading="lazy"])')
    const count = await imageLinks.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await imageLinks.nth(i).getAttribute('href')
      expect(href).toEqual(`/en/products/${i + 1}/`)
    }
  })

  test('each product buy button links to its product page', async ({
    page,
  }) => {
    const carousel = page.locator('#products')
    const buyLinks = carousel.locator('a[aria-label^="Buy"]')
    const count = await buyLinks.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await buyLinks.nth(i).getAttribute('href')
      expect(href).toEqual(`/en/products/${i + 1}/`)
    }
  })

  test('product links use the current language', async ({ page }) => {
    await page.goto('/bg/')

    const carousel = page.locator('#products')
    const allLinks = carousel.locator('a[href*="/products/"]')
    const count = await allLinks.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await allLinks.nth(i).getAttribute('href')
      expect(href).toMatch(/^\/bg\/products\/\d+\/$/)
    }
  })
})
