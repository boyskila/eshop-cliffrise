import { test, expect } from '@playwright/test'
import { openContactFormModal } from './helpers'

test.describe('Contact Form Modal - Submission UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.afterEach(async ({ request }) => {
    await request.get('/api/test/delete-emails/')
  })

  test('URL being cleared from form inputs on submit', async ({ page }) => {
    const dialog = await openContactFormModal(page)

    await dialog.getByPlaceholder('Name').fill('John Doe')
    await dialog.getByPlaceholder('Email').fill('john@example.com')
    await dialog.getByPlaceholder('Message').fill('This is a test message')

    const submitButton = dialog.getByRole('button', { name: 'Send' })
    const submitResponse = page.waitForResponse(
      (response) =>
        response.url().includes('_actions/contact') &&
        response.request().method() === 'POST',
    )
    await submitButton.click()
    await submitResponse

    const currentUrl = page.url()
    expect(currentUrl).not.toContain('name=')
    expect(currentUrl).not.toContain('email=')
    expect(currentUrl).not.toContain('message=')
  })

  test('success message after form submission', async ({ page }) => {
    const dialog = await openContactFormModal(page)

    await dialog.getByPlaceholder('Name').fill('John Doe')
    await dialog.getByPlaceholder('Email').fill('john@example.com')
    await dialog.getByPlaceholder('Message').fill('This is a test message')

    const submitButton = dialog.getByRole('button', { name: 'Send' })
    await submitButton.click()

    const successMessage = dialog.locator('[data-form-success-msg]')
    await expect(successMessage).toHaveText(
      "Thanks for reaching out! We'll get back to you shortly.",
    )
  })

  test('submit button disabled during form submission', async ({ page }) => {
    const dialog = await openContactFormModal(page)

    await dialog.getByPlaceholder('Name').fill('John Doe')
    await dialog.getByPlaceholder('Email').fill('john@example.com')
    await dialog.getByPlaceholder('Message').fill('This is a test message')

    const submitButton = dialog.locator('button[type="submit"]', {
      hasText: 'Send',
    })

    await expect(submitButton).toBeEnabled()
    await submitButton.click()
    await expect(submitButton).toBeDisabled()
  })

  test('submit button enabled after reopening the dialog', async ({ page }) => {
    const dialog = await openContactFormModal(page)

    await dialog.getByPlaceholder('Name').fill('John Doe')
    await dialog.getByPlaceholder('Email').fill('john@example.com')
    await dialog.getByPlaceholder('Message').fill('This is a test message')

    const submitButton = dialog.getByRole('button', {
      name: 'Send',
    })
    await submitButton.click()

    await expect(dialog).toBeHidden({ timeout: 7000 })

    const reopened = await openContactFormModal(page)
    const submitButtonReopened = reopened.getByRole('button', { name: 'Send' })

    await expect(submitButtonReopened).toBeEnabled()
  })

  test('changing submit button text from "Send" to "Sending..." during submission', async ({
    page,
  }) => {
    const dialog = await openContactFormModal(page)

    await dialog.getByPlaceholder('Name').fill('John Doe')
    await dialog.getByPlaceholder('Email').fill('john@example.com')
    await dialog.getByPlaceholder('Message').fill('This is a test message')

    const submitButton = dialog.locator(
      'button[type="submit"][data-submit-contact-form]',
    )
    const sendText = submitButton.getByText('Send', { exact: true })
    const sendingText = submitButton.getByText('Sending...')

    await page.route(
      '**/_actions/contact/**',
      async (route) => {
        const response = await route.fetch()
        await route.fulfill({ response })
      },
      { times: 1 },
    )

    const submitResponse = page.waitForResponse(
      (response) =>
        response.url().includes('_actions/contact') &&
        response.request().method() === 'POST',
    )

    await expect(sendText).toBeVisible()
    await expect(sendingText).toBeHidden()
    await submitButton.click()
    await expect(sendingText).toBeVisible()
    await expect(sendText).toBeHidden()
    await submitResponse
  })
})

