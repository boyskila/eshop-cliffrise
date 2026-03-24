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

const getVisiblePanel = (dialog: Locator) => {
  return dialog.locator('[data-product-modal-panel]:not(.hidden)')
}

test.describe('Image Thumbnails', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('first thumbnail is selected by default when modal opens', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)
    const thumbnails = panel.locator('[data-image-thumb]')

    await expect(thumbnails.first()).toHaveAttribute('aria-pressed', 'true')
  })

  test('clicking a thumbnail updates the product image', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const productImage = panel.locator('[data-product-image]')
    const thumbnails = panel.locator('[data-image-thumb]')

    await thumbnails.first().click()

    await expect(thumbnails.first()).toHaveAttribute('aria-pressed', 'true')
    await expect(thumbnails.nth(1)).toHaveAttribute('aria-pressed', 'false')

    const expectedSrc = await thumbnails.first().getAttribute('data-image-src')
    await expect(productImage).toHaveAttribute('src', expectedSrc!)
  })

  test('clicking the same thumbnail keeps it selected', async ({ page }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const thumbnails = panel.locator('[data-image-thumb]')

    await thumbnails.first().click()
    await expect(thumbnails.first()).toHaveAttribute('aria-pressed', 'true')

    await thumbnails.first().click()
    await expect(thumbnails.first()).toHaveAttribute('aria-pressed', 'true')
  })

  test('each thumbnail click updates the main image to match', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)

    const productImage = panel.locator('[data-product-image]')
    const thumbnails = panel.locator('[data-image-thumb]')
    const count = await thumbnails.count()

    for (let i = 0; i < count; i++) {
      await thumbnails.nth(i).click()
      const expectedSrc = await thumbnails.nth(i).getAttribute('data-image-src')
      await expect(productImage).toHaveAttribute('src', expectedSrc!)
      await expect(thumbnails.nth(i)).toHaveAttribute('aria-pressed', 'true')

      for (let j = 0; j < count; j++) {
        if (j !== i) {
          await expect(thumbnails.nth(j)).toHaveAttribute(
            'aria-pressed',
            'false',
          )
        }
      }
    }
  })
})

test.describe('Image Thumbnails - AbortController cleanup', () => {
  test('listeners are re-attached after client-side navigation (no duplicate handlers)', async ({
    page,
  }) => {
    await page.goto('/')

    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)
    const thumbnails = panel.locator('[data-image-thumb]')

    await thumbnails.last().click()
    await expect(thumbnails.last()).toHaveAttribute('aria-pressed', 'true')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    await page.goto('/bg/')
    await page.goto('/')

    const dialog2 = await openProductModal(page, 'Chunky Chalk')
    const panel2 = getVisiblePanel(dialog2)
    const thumbnails2 = panel2.locator('[data-image-thumb]')
    const productImage2 = panel2.locator('[data-product-image]')

    await expect(thumbnails2.first()).toHaveAttribute('aria-pressed', 'true')

    const expectedSrc = await thumbnails2.last().getAttribute('data-image-src')
    await thumbnails2.last().click()

    await expect(productImage2).toHaveAttribute('src', expectedSrc!)
    await expect(thumbnails2.last()).toHaveAttribute('aria-pressed', 'true')
    await expect(thumbnails2.first()).toHaveAttribute('aria-pressed', 'false')
  })

  test('old listeners are removed after navigation', async ({ page }) => {
    await page.goto('/')

    const srcChanges: string[] = []
    await page.exposeFunction('trackSrcChange', (src: string) => {
      srcChanges.push(src)
    })

    await openProductModal(page, 'Chunky Chalk')

    await page.keyboard.press('Escape')
    await page.goto('/bg/')
    await page.goto('/')

    const dialog2 = await openProductModal(page, 'Chunky Chalk')
    const panel2 = getVisiblePanel(dialog2)
    const thumbnails2 = panel2.locator('[data-image-thumb]')

    await page.evaluate(() => {
      const img = document.querySelector(
        '[data-product-modal-panel]:not(.hidden) [data-product-image]',
      ) as HTMLImageElement
      ;(window as any).__srcChanges = []
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.attributeName === 'src') {
            ;(window as any).__srcChanges.push(img.src)
          }
        }
      })
      observer.observe(img, { attributes: true, attributeFilter: ['src'] })
    })

    await thumbnails2.first().click()

    await page.waitForTimeout(100)

    const changes = await page.evaluate(() => (window as any).__srcChanges)
    expect(changes).toHaveLength(1)
  })
})

test.describe('Image Thumbnails - Reset on modal close', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('thumbnail selection resets to first after modal is closed and reopened', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)
    const thumbnails = panel.locator('[data-image-thumb]')

    await thumbnails.last().click()
    await expect(thumbnails.last()).toHaveAttribute('aria-pressed', 'true')
    await expect(thumbnails.first()).toHaveAttribute('aria-pressed', 'false')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    const dialog2 = await openProductModal(page, 'Chunky Chalk')
    const panel2 = getVisiblePanel(dialog2)
    const thumbnails2 = panel2.locator('[data-image-thumb]')

    await expect(thumbnails2.first()).toHaveAttribute('aria-pressed', 'true')
    await expect(thumbnails2.last()).toHaveAttribute('aria-pressed', 'false')
  })

  test('product image resets to default after modal is closed and reopened', async ({
    page,
  }) => {
    const dialog = await openProductModal(page, 'Chunky Chalk')
    const panel = getVisiblePanel(dialog)
    const productImage = panel.locator('[data-product-image]')
    const thumbnails = panel.locator('[data-image-thumb]')

    const defaultSrc = await productImage.getAttribute('data-default-image')

    await thumbnails.last().click()
    const secondSrc = await thumbnails.last().getAttribute('data-image-src')
    await expect(productImage).toHaveAttribute('src', secondSrc!)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    const dialog2 = await openProductModal(page, 'Chunky Chalk')
    const panel2 = getVisiblePanel(dialog2)
    const productImage2 = panel2.locator('[data-product-image]')

    await expect(productImage2).toHaveAttribute('src', defaultSrc!)
  })
})
