import { test, expect } from '@playwright/test'
import { openContactFormModal } from './helpers'

test.describe('Contact Form Modal - BG Locale', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bg/')
  })

  test.afterEach(async ({ request }) => {
    await request.get('/api/test/delete-emails/')
  })

  test('success message and form fields', async ({ page }) => {
    const dialog = await openContactFormModal(page, /свържи се с нас/i)

    await dialog.locator('input[name="name"]').fill('John Doe')
    await dialog.locator('input[name="email"]').fill('john@example.com')
    await dialog.locator('textarea[name="message"]').fill('This is a test message')

    const submitButton = dialog.locator('[data-submit-contact-form]')
    await submitButton.click()
    const successMessage = dialog.locator('[data-form-success-msg]')
    await expect(successMessage).toBeVisible()
  })

  test('submit button text has both states', async ({ page }) => {
    const dialog = await openContactFormModal(page, /свържи се с нас/i)
    const submitButton = dialog.locator('[data-submit-contact-form]')
    await expect(submitButton).toContainText('Изпращане...')
    await expect(submitButton).toContainText('Изпрати')
  })

  test('header and description are visible', async ({ page }) => {
    const dialog = await openContactFormModal(page, /свържи се с нас/i)
    await expect(dialog.getByRole('heading')).toBeVisible()
    await expect(dialog.locator('p').first()).toBeVisible()
  })
})
