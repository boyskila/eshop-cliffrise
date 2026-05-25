import { test, expect } from '@playwright/test'

test.describe('Products Carousel - Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bg/')
  })

  test('each product image links to its product page', async ({ page }) => {
    const carousel = page.locator('#products')
    const imageLinks = carousel.locator('a:has([data-product-card-image])')
    const count = await imageLinks.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await imageLinks.nth(i).getAttribute('href')
      expect(href).toEqual(`/bg/products/${i + 1}/`)
    }
  })

  test('hover image uses Tailwind-only delayed visibility', async ({
    page,
  }) => {
    const carousel = page.locator('#products')
    const imageLink = carousel
      .locator('a:has([data-product-card-image])')
      .first()
    const hoverImage = imageLink.locator('[data-product-card-hover-image]')

    await expect(imageLink).toHaveClass(/hover:opacity-100/)
    await expect(imageLink).toHaveClass(/transition-none/)
    await expect(hoverImage).toHaveClass(/opacity-0/)
    await expect(hoverImage).toHaveClass(/duration-0/)
    await expect(hoverImage).toHaveClass(/group-hover:delay-350/)
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
      expect(href).toEqual(`/bg/products/${i + 1}/`)
    }
  })

  test('product links use the explicit English language', async ({ page }) => {
    await page.goto('/en/')

    const carousel = page.locator('#products')
    const allLinks = carousel.locator('a[href*="/products/"]')
    const count = await allLinks.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await allLinks.nth(i).getAttribute('href')
      expect(href).toMatch(/^\/en\/products\/\d+\/$/)
    }
  })

  test('product links use the explicit Bulgarian language', async ({ page }) => {
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
