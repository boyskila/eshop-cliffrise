import { test, expect } from '@playwright/test'
import { openContactFormModal } from './helpers'

test.describe('Contact Form Modal - Basic UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.afterEach(async ({ request }) => {
    await request.get('/api/test/delete-emails/')
  })

  test('closing the modal upon close button click', async ({ page }) => {
    const dialog = await openContactFormModal(page)
    const closeButton = dialog.getByRole('button', { name: 'Close modal' })
    await closeButton.click()
    await expect(dialog).toBeHidden()
  })

  test('header text and description', async ({ page }) => {
    const dialog = await openContactFormModal(page)
    await expect(
      dialog.getByRole('heading', { name: /support/i }),
    ).toBeVisible()
    await expect(dialog).toContainText(
      /We develop climbing routes and maintain climbing areas\./i,
    )
    await expect(dialog).toContainText(
      /If you['’]d like to get involved, support the work, or simply ask a question, write to us and we['’]ll get back to you\./i,
    )
  })
})
