import { test, expect, type Page } from '@playwright/test'

const openContactFormModal = async (page: Page) => {
  const dialog = page.locator('#contactFormModal')
  const openButton = page.getByRole('button', {
    name: /contact us|свържи се с нас/i,
  })
  await openButton.click()
  return dialog
}

test.describe('Contact Form Modal', () => {
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

  test('URL being cleared from form inputs on submit', async ({ page }) => {
    const dialog = await openContactFormModal(page)

    await dialog.getByPlaceholder('Name').fill('John Doe')
    await dialog.getByPlaceholder('Email').fill('john@example.com')
    await dialog.getByPlaceholder('Message').fill('This is a test message')

    const submitButton = dialog.getByRole('button', { name: 'Send' })
    await submitButton.click()

    const currentUrl = page.url()
    expect(currentUrl).not.toContain('name=')
    expect(currentUrl).not.toContain('email=')
    expect(currentUrl).not.toContain('message=')
  })

  test('send email when form is submitted with valid data', async ({
    page,
    request,
  }) => {
    const dialog = await openContactFormModal(page)

    await dialog.getByPlaceholder('Name').fill('Test User')
    await dialog.getByPlaceholder('Email').fill('test@example.com')
    await dialog
      .getByPlaceholder('Message')
      .fill('This is a test message for email verification')

    const submitButton = dialog.getByRole('button', { name: 'Send' })

    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('_actions/contact'),
    )

    await submitButton.click()
    await responsePromise

    const response = await request.get('/api/test/sent-emails/')
    const data = await response.json()

    expect(data.emails).toHaveLength(1)

    expect(data.emails[0]).toMatchObject({
      to: 'boiskila@gmail.com',
      subject: '[CliffRise] New message from Test User',
      from: 'CliffRise Contact <onboarding@resend.dev>',
      replyTo: 'test@example.com',
      html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> Test User</p>
          <p><strong>Email:</strong> test@example.com</p>
          <p><strong>Message:</strong></p>
          <p>This is a test message for email verification</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            IP: unknown
          </p>
        `,
    })
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

    const dialogReopened = await openContactFormModal(page)
    const submitButtonReopened = dialogReopened.getByRole('button', {
      name: 'Send',
    })

    await expect(submitButtonReopened).toBeEnabled()
  })

  test('changing submit button text from "Send" to "Sending..." during submission', async ({
    page,
  }) => {
    const dialog = await openContactFormModal(page)

    await dialog.getByPlaceholder('Name').fill('John Doe')
    await dialog.getByPlaceholder('Email').fill('john@example.com')
    await dialog.getByPlaceholder('Message').fill('This is a test message')

    const submitButton = dialog.getByRole('button', {
      name: 'Send',
    })

    await expect(submitButton.getByText('Send', { exact: true })).toBeVisible()
    await expect(submitButton.getByText('Sending...')).toBeHidden()
    await submitButton.click({ delay: 500 })
    await expect(submitButton.getByText('Sending...')).toBeVisible()
    await expect(submitButton.getByText('Send', { exact: true })).toBeHidden()
  })

  test('header text and description', async ({ page }) => {
    const dialog = await openContactFormModal(page)

    await expect(
      dialog.getByRole('heading', { name: /support/i }),
    ).toBeVisible()
    await expect(dialog).toContainText(
      'We develop climbing routes and maintain climbing areas. If you’d like to get involved, support the work, or simply ask a question, write to us and we’ll get back to you. ',
    )
  })
})
