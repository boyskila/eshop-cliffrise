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

test.describe('Kind Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('no kind option is selected by default', async ({ page }) => {
    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')
    const count = await kindOptions.count()

    for (let i = 0; i < count; i++) {
      await expect(kindOptions.nth(i)).toHaveAttribute('aria-pressed', 'false')
    }
  })

  test('add to cart and buy now buttons are disabled by default for products with kind', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)

    const addToCart = panel.locator('[data-add-to-cart-button]')
    const buyNow = panel.locator('[data-buy-now-button]')

    await expect(addToCart).toBeDisabled()
    await expect(buyNow).toBeDisabled()
  })

  test('clicking a kind option selects it and deselects others', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')

    await kindOptions.first().click()
    await expect(kindOptions.first()).toHaveAttribute('aria-pressed', 'true')

    await kindOptions.last().click()
    await expect(kindOptions.last()).toHaveAttribute('aria-pressed', 'true')
    await expect(kindOptions.first()).toHaveAttribute('aria-pressed', 'false')
  })

  test('clicking a kind option enables add to cart and buy now buttons', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')

    const addToCart = panel.locator('[data-add-to-cart-button]')
    const buyNow = panel.locator('[data-buy-now-button]')

    await kindOptions.first().click()

    await expect(addToCart).toBeEnabled()
    await expect(buyNow).toBeEnabled()
  })

  test('clicking a kind option sets data-product-kind on action buttons', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')

    const addToCart = panel.locator('[data-add-to-cart-button]')
    const buyNow = panel.locator('[data-buy-now-button]')

    await kindOptions.last().click()

    const expectedKind = await kindOptions.last().getAttribute('data-kind-name')
    await expect(addToCart).toHaveAttribute('data-product-kind', expectedKind!)
    await expect(buyNow).toHaveAttribute('data-product-kind', expectedKind!)
  })

  test('switching kind options updates the selection', async ({ page }) => {
    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')
    const addToCart = panel.locator('[data-add-to-cart-button]')

    await kindOptions.first().click()
    const firstKind = await kindOptions.first().getAttribute('data-kind-name')
    await expect(addToCart).toHaveAttribute('data-product-kind', firstKind!)

    await kindOptions.nth(2).click()
    const thirdKind = await kindOptions.nth(2).getAttribute('data-kind-name')
    await expect(addToCart).toHaveAttribute('data-product-kind', thirdKind!)
  })

  test('selecting a kind with an image updates the product image', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Beanie')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')
    const productImage = panel.locator('[data-product-image]')

    await kindOptions.first().click()

    const expectedImage = await kindOptions
      .first()
      .getAttribute('data-kind-image')
    await expect(productImage).toHaveAttribute('src', expectedImage!)
  })

  test('each kind option can be selected individually', async ({ page }) => {
    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')
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

test.describe('Kind Selector - Reset on modal close', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('kind selection resets after modal is closed and reopened', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')

    await kindOptions.first().click()
    await expect(kindOptions.first()).toHaveAttribute('aria-pressed', 'true')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    const dialog2 = await openProductModal(page, 'T\u2011Shirt')
    const panel2 = getVisiblePanel(dialog2)
    const kindOptions2 = panel2.locator('[data-kind-option]')
    const count = await kindOptions2.count()

    // All options should be deselected
    for (let i = 0; i < count; i++) {
      await expect(kindOptions2.nth(i)).toHaveAttribute('aria-pressed', 'false')
    }
  })

  test('action buttons are disabled again after modal is closed and reopened', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')

    const addToCart = panel.locator('[data-add-to-cart-button]')
    const buyNow = panel.locator('[data-buy-now-button]')

    await kindOptions.first().click()
    await expect(addToCart).toBeEnabled()
    await expect(buyNow).toBeEnabled()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    const dialog2 = await openProductModal(page, 'T\u2011Shirt')
    const panel2 = getVisiblePanel(dialog2)

    const addToCart2 = panel2.locator('[data-add-to-cart-button]')
    const buyNow2 = panel2.locator('[data-buy-now-button]')

    await expect(addToCart2).toBeDisabled()
    await expect(buyNow2).toBeDisabled()
  })

  test('product image resets after kind with image is selected and modal is closed', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Beanie')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')
    const productImage = panel.locator('[data-product-image]')
    const thumbnails = panel.locator('[data-image-thumb]')

    const firstThumbSrc = await thumbnails
      .first()
      .getAttribute('data-image-src')

    await kindOptions.first().click()
    const kindImage = await kindOptions.first().getAttribute('data-kind-image')
    await expect(productImage).toHaveAttribute('src', kindImage!)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    const dialog2 = await openProductModal(page, 'Beanie')
    const panel2 = getVisiblePanel(dialog2)
    const productImage2 = panel2.locator('[data-product-image]')

    await expect(productImage2).toHaveAttribute('src', firstThumbSrc!)
  })
})

test.describe('Kind Selector - AbortController cleanup', () => {
  test('listeners work correctly after navigation', async ({ page }) => {
    await page.goto('/')

    const dialog = await openProductModal(page, 'T\u2011Shirt')
    const panel = getVisiblePanel(dialog)
    const kindOptions = panel.locator('[data-kind-option]')

    await kindOptions.nth(1).click()
    await expect(kindOptions.nth(1)).toHaveAttribute('aria-pressed', 'true')

    await page.keyboard.press('Escape')
    await page.goto('/bg/')
    await page.goto('/')

    const dialog2 = await openProductModal(page, 'T\u2011Shirt')
    const panel2 = getVisiblePanel(dialog2)
    const kindOptions2 = panel2.locator('[data-kind-option]')
    const addToCart2 = panel2.locator('[data-add-to-cart-button]')

    const count = await kindOptions2.count()
    for (let i = 0; i < count; i++) {
      await expect(kindOptions2.nth(i)).toHaveAttribute('aria-pressed', 'false')
    }
    await expect(addToCart2).toBeDisabled()

    await kindOptions2.first().click()
    await expect(kindOptions2.first()).toHaveAttribute('aria-pressed', 'true')
    await expect(addToCart2).toBeEnabled()

    const expectedKind = await kindOptions2
      .first()
      .getAttribute('data-kind-name')
    await expect(addToCart2).toHaveAttribute('data-product-kind', expectedKind!)
  })
})
