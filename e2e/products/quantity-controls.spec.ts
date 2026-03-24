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

test.describe('Quantity Controls - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('quantity controls are wrapped in a labeled group', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const group = panel.getByRole('group', { name: /quantity/i })
    await expect(group).toBeVisible()
  })

  test('quantity value uses an output element with aria-live', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const output = panel.locator('output')
    await expect(output).toHaveAttribute('aria-live', 'polite')
    await expect(output).toHaveText('1')
  })

  test('output has an accessible label', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const output = panel.locator('output')
    await expect(output).toHaveAttribute('aria-label', /current quantity/i)
  })

  test('decrease and increase buttons have accessible labels', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const decreaseBtn = panel.getByRole('button', {
      name: /decrease quantity/i,
    })
    const increaseBtn = panel.getByRole('button', {
      name: /increase quantity/i,
    })

    await expect(decreaseBtn).toBeVisible()
    await expect(increaseBtn).toBeVisible()
  })

  test('icon SVGs are hidden from screen readers', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const group = panel.getByRole('group', { name: /quantity/i })
    const svgs = group.locator('svg')
    const count = await svgs.count()

    for (let i = 0; i < count; i++) {
      await expect(svgs.nth(i)).toHaveAttribute('aria-hidden', 'true')
    }
  })
})

test.describe('Quantity Controls - Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('quantity starts at 1', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const output = panel.locator('output')
    await expect(output).toHaveText('1')
  })

  test('increase button increments quantity', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const increaseBtn = panel.getByRole('button', {
      name: /increase quantity/i,
    })
    const output = panel.locator('output')

    await increaseBtn.click()
    await expect(output).toHaveText('2')

    await increaseBtn.click()
    await expect(output).toHaveText('3')
  })

  test('decrease button decrements quantity', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const increaseBtn = panel.getByRole('button', {
      name: /increase quantity/i,
    })
    const decreaseBtn = panel.getByRole('button', {
      name: /decrease quantity/i,
    })
    const output = panel.locator('output')

    await increaseBtn.click()
    await increaseBtn.click()
    await expect(output).toHaveText('3')

    await decreaseBtn.click()
    await expect(output).toHaveText('2')
  })

  test('quantity cannot go below 1', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const decreaseBtn = panel.getByRole('button', {
      name: /decrease quantity/i,
    })
    const output = panel.locator('output')

    await expect(output).toHaveText('1')

    await decreaseBtn.click()
    await decreaseBtn.click()
    await expect(output).toHaveText('1')
  })

  test('quantity resets to 1 when modal is closed', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const increaseBtn = panel.getByRole('button', {
      name: /increase quantity/i,
    })
    const output = panel.locator('output')

    await increaseBtn.click()
    await increaseBtn.click()
    await expect(output).toHaveText('3')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await openProductModal(page, 'Chunky Chalk')
    const panel2 = getVisiblePanel(dialog)
    const output2 = panel2.locator('output')
    await expect(output2).toHaveText('1')
  })
})
