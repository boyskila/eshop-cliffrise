import { test, expect, type Page, type Locator } from '@playwright/test'

const openProductModal = async (page: Page, productName: string) => {
  await page
    .locator(`[data-open-product-modal][aria-label*="${productName}"]`)
    .first()
    .click()

  const dialog = page.locator('#productModal')
  await expect(dialog).toBeVisible()
  return dialog
}

const getVisiblePanel = (dialog: Locator) =>
  dialog.locator('[data-product-modal-panel]:not(.hidden)')

test.describe('Product Modal - Open and Close', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('modal is hidden by default', async ({ page }) => {
    const dialog = page.locator('#productModal')
    await expect(dialog).toBeHidden()
  })

  test('clicking a product open button opens the modal', async ({ page }) => {
    await page
      .locator(`[data-open-product-modal][aria-label*="Chunky Chalk"]`)
      .first()
      .click()

    const dialog = page.locator('#productModal')
    await expect(dialog).toBeVisible()
  })

  test('shows the correct product panel when opened', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    await expect(panel).toHaveCount(1)
    await expect(panel.locator('[data-product-name]')).toHaveText(
      'Chunky Chalk – 250 g',
    )
  })

  test('pressing Escape closes the modal', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('clicking the close button closes the modal', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')

    const closeButton = dialog.locator('button[aria-label="Close modal"]')
    await closeButton.click()
    await expect(dialog).toBeHidden()
  })

  test('body overflow is hidden while modal is open', async ({ page }) => {
    await openProductModal(page, 'Chunky Chalk')

    const hasOverflowHidden = await page.evaluate(() =>
      document.body.classList.contains('overflow-hidden'),
    )
    expect(hasOverflowHidden).toBe(true)
  })

  test('body overflow is restored after modal is closed', async ({ page }) => {
    await openProductModal(page, 'Chunky Chalk')
    await page.keyboard.press('Escape')

    const hasOverflowHidden = await page.evaluate(() =>
      document.body.classList.contains('overflow-hidden'),
    )
    expect(hasOverflowHidden).toBe(false)
  })
})

test.describe('Product Modal - Panel switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('opening different products shows the correct panel each time', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    let panel = getVisiblePanel(dialog)
    await expect(panel.locator('[data-product-name]')).toHaveText(
      'Chunky Chalk – 250 g',
    )

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await openProductModal(page, 'Beanie')
    panel = getVisiblePanel(dialog)
    await expect(panel).toHaveCount(1)
    await expect(panel.locator('[data-product-name]')).toHaveText(
      'Beanie with a Cause',
    )
  })

  test('only one panel is visible at a time', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const visiblePanels = getVisiblePanel(dialog)

    await expect(visiblePanels).toHaveCount(1)
  })

  test('hidden panels have aria-hidden true', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const allPanels = dialog.locator('[data-product-modal-panel]')
    const count = await allPanels.count()

    let visibleCount = 0
    for (let i = 0; i < count; i++) {
      const ariaHidden = await allPanels.nth(i).getAttribute('aria-hidden')
      if (ariaHidden === 'false') visibleCount++
    }

    expect(visibleCount).toBe(1)
  })
})

test.describe('Product Modal - Price Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays product price with euro symbol', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const price = panel.locator('.text-right.font-semibold')
    await expect(price).toContainText('12.99')
    await expect(price).toContainText('€')
  })
})

test.describe('Product Modal - Action Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('add to cart and buy now buttons are visible for products without kind', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const addToCart = panel.locator('[data-add-to-cart-button]')
    const buyNow = panel.locator('[data-buy-now-button]')

    await expect(addToCart).toBeVisible()
    await expect(buyNow).toBeVisible()
  })

  test('add to cart and buy now buttons are enabled for products without kind', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const addToCart = panel.locator('[data-add-to-cart-button]')
    const buyNow = panel.locator('[data-buy-now-button]')

    await expect(addToCart).toBeEnabled()
    await expect(buyNow).toBeEnabled()
  })

  test('add to cart and buy now buttons are disabled for products with kind until selected', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)

    const addToCart = panel.locator('[data-add-to-cart-button]')
    const buyNow = panel.locator('[data-buy-now-button]')

    await expect(addToCart).toBeDisabled()
    await expect(buyNow).toBeDisabled()

    const kindOption = panel.locator('[data-kind-option]').first()
    await kindOption.click()

    await expect(addToCart).toBeEnabled()
    await expect(buyNow).toBeEnabled()
  })
})

test.describe('Product Modal - AbortController cleanup', () => {
  test('modal works correctly after client-side navigation', async ({
    page,
  }) => {
    await page.goto('/')

    const dialog = await openProductModal(page, 'Chunky Chalk')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await page.goto('/bg/')
    await page.goto('/')

    const dialog2 = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog2)
    await expect(panel.locator('[data-product-name]')).toHaveText(
      'Chunky Chalk – 250 g',
    )

    await page.keyboard.press('Escape')
    await expect(dialog2).toBeHidden()

    const hasOverflowHidden = await page.evaluate(() =>
      document.body.classList.contains('overflow-hidden'),
    )
    expect(hasOverflowHidden).toBe(false)
  })
})
