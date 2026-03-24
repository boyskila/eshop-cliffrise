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

test.describe('Product Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays the product name', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const name = panel.locator('[data-product-name]')
    await expect(name).toHaveText('Chunky Chalk – 250 g')
  })

  test('displays the product description', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const description = panel.locator('[data-product-description]')
    await expect(description).toContainText(
      'Chunky climbing chalk with a coarse structure that breaks down easily and provides reliable friction. Made for bouldering, sport routes and long climbing sessions. Open. Crush. Climb.',
    )
  })

  test('product name is rendered as an h3 heading', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const heading = panel.locator('h3[data-product-name]')
    await expect(heading).toBeVisible()
  })

  test('description has scroll for long content', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const description = panel.locator('[data-product-description]')
    await expect(description).toHaveCSS('overflow-y', 'scroll')
  })
})
