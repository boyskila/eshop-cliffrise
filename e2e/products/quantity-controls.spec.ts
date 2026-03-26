import { test, expect } from '@playwright/test'

// Chunky Chalk (id=1) has no kind options, so buttons are enabled by default
const PRODUCT_URL = '/en/products/1/'

test.describe('Quantity Controls - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCT_URL)
  })

  test('quantity controls are wrapped in a labeled group', async ({ page }) => {
    const group = page.getByRole('group', { name: /quantity/i })
    await expect(group).toBeVisible()
  })

  test('quantity value uses an output element with aria-live', async ({
    page,
  }) => {
    const output = page.locator('output')
    await expect(output).toHaveAttribute('aria-live', 'polite')
    await expect(output).toHaveText('1')
  })

  test('output has an accessible label', async ({ page }) => {
    const output = page.locator('output')
    await expect(output).toHaveAttribute('aria-label', /current quantity/i)
  })

  test('decrease and increase buttons have accessible labels', async ({
    page,
  }) => {
    const decreaseBtn = page.getByRole('button', {
      name: /decrease quantity/i,
    })
    const increaseBtn = page.getByRole('button', {
      name: /increase quantity/i,
    })

    await expect(decreaseBtn).toBeVisible()
    await expect(increaseBtn).toBeVisible()
  })

  test('icon SVGs are hidden from screen readers', async ({ page }) => {
    const group = page.getByRole('group', { name: /quantity/i })
    const svgs = group.locator('svg')
    const count = await svgs.count()

    for (let i = 0; i < count; i++) {
      await expect(svgs.nth(i)).toHaveAttribute('aria-hidden', 'true')
    }
  })
})

test.describe('Quantity Controls - Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCT_URL)
  })

  test('quantity starts at 1', async ({ page }) => {
    const output = page.locator('output')
    await expect(output).toHaveText('1')
  })

  test('increase button increments quantity', async ({ page }) => {
    const increaseBtn = page.getByRole('button', {
      name: /increase quantity/i,
    })
    const output = page.locator('output')

    await increaseBtn.click()
    await expect(output).toHaveText('2')

    await increaseBtn.click()
    await expect(output).toHaveText('3')
  })

  test('decrease button decrements quantity', async ({ page }) => {
    const increaseBtn = page.getByRole('button', {
      name: /increase quantity/i,
    })
    const decreaseBtn = page.getByRole('button', {
      name: /decrease quantity/i,
    })
    const output = page.locator('output')

    await increaseBtn.click()
    await increaseBtn.click()
    await expect(output).toHaveText('3')

    await decreaseBtn.click()
    await expect(output).toHaveText('2')
  })

  test('quantity cannot go below 1', async ({ page }) => {
    const decreaseBtn = page.getByRole('button', {
      name: /decrease quantity/i,
    })
    const output = page.locator('output')

    await expect(output).toHaveText('1')

    await decreaseBtn.click()
    await decreaseBtn.click()
    await expect(output).toHaveText('1')
  })
})
