import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from '@playwright/test'

const openContactFormModal = async (page: Page) => {
  const dialog = page.locator('#contactFormModal')
  const openButton = page.getByRole('button', {
    name: /contact us|свържи се с нас/i,
  })
  await openButton.click()
  return dialog
}

const submitContactAction = async (
  request: APIRequestContext,
  payload: {
    name: string
    email: string
    message: string
    company?: string
  },
) => {
  return request.post('/_actions/contact/', {
    headers: {
      origin: 'http://127.0.0.1:4321',
      accept: 'application/json',
    },
    multipart: {
      name: payload.name,
      email: payload.email,
      message: payload.message,
      company: payload.company ?? '',
    },
  })
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

    // Wait for the contact action response before polling the fake mailbox.
    await expect
      .poll(
        async () => {
          // Mail capture can lag behind the action response in CI, so poll until it appears.
          const response = await request.get('/api/test/sent-emails/')
          const data = await response.json()
          return data.emails
        },
        {
          message: 'Expected one sent email after successful form submission',
          timeout: 5000,
        },
      )
      .toHaveLength(1)

    const response = await request.get('/api/test/sent-emails/')
    const data = await response.json()

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

    const submitButton = dialog.locator(
      'button[type="submit"][data-submit-contact-form]',
    )
    const sendText = submitButton.getByText('Send', { exact: true })
    const sendingText = submitButton.getByText('Sending...')

    // Slow down only this action call so the "Sending..." UI state is observable.
    await page.route(
      '**/_actions/contact/**',
      async (route) => {
        const response = await route.fetch()
        // await page.waitForTimeout(300)
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

  test('header text and description', async ({ page }) => {
    const dialog = await openContactFormModal(page)

    await expect(
      dialog.getByRole('heading', { name: /support/i }),
    ).toBeVisible()
    await expect(dialog).toContainText(
      'We develop climbing routes and maintain climbing areas. If you’d like to get involved, support the work, or simply ask a question, write to us and we’ll get back to you. ',
    )
  })

  test('sanitizes and escapes input before sending email', async ({
    request,
  }) => {
    const actionResponse = await submitContactAction(request, {
      name: '  <b>Test\tUser</b>\u0007  ',
      email: 'test@example.com',
      message: 'Hello <script>alert(1)</script>\u0007\r\nLine 2',
    })

    expect(actionResponse.ok()).toBeTruthy()

    await expect
      .poll(
        async () => {
          const response = await request.get('/api/test/sent-emails/')
          const data = await response.json()
          return data.emails
        },
        { timeout: 5000 },
      )
      .toHaveLength(1)

    const inboxResponse = await request.get('/api/test/sent-emails/')
    const inbox = await inboxResponse.json()
    const email = inbox.emails[0]

    expect(email.subject).toBe(
      '[CliffRise] New message from &lt;b&gt;Test User&lt;/b&gt;',
    )
    expect(email.replyTo).toBe('test@example.com')
    expect(email.html).toContain(
      '<p>Hello &lt;script&gt;alert(1)&lt;/script&gt;<br>Line 2</p>',
    )
    expect(email.html).not.toContain('<script>')
  })

  test('rejects invalid payload via zod validation and does not send email', async ({
    request,
  }) => {
    const actionResponse = await submitContactAction(request, {
      name: 'A',
      email: 'invalid-email',
      message: 'short',
    })

    expect(actionResponse.status()).toBe(400)

    const body = await actionResponse.json()
    expect(body).toMatchObject({
      type: 'AstroActionInputError',
      fields: {
        name: expect.any(Array),
        email: expect.any(Array),
        message: expect.any(Array),
      },
    })

    const inboxResponse = await request.get('/api/test/sent-emails/')
    const inbox = await inboxResponse.json()
    expect(inbox.emails).toHaveLength(0)
  })

  test('accepts zod upper boundary values', async ({ request }) => {
    const maxName = 'N'.repeat(100)
    const localPart = 'a'.repeat(64)
    const domainLabel = 'b'.repeat(61)
    const boundaryEmail = `${localPart}@${domainLabel}.com` // 254 chars total
    const maxMessage = 'M'.repeat(5000)

    const actionResponse = await submitContactAction(request, {
      name: maxName,
      email: boundaryEmail,
      message: maxMessage,
    })

    expect(actionResponse.ok()).toBeTruthy()

    await expect
      .poll(
        async () => {
          const response = await request.get('/api/test/sent-emails/')
          const data = await response.json()
          return data.emails
        },
        { timeout: 5000 },
      )
      .toHaveLength(1)
  })

  test('rejects zod values outside boundaries', async ({ request }) => {
    const tooLongName = 'N'.repeat(101)
    const tooLongMessage = 'M'.repeat(5001)

    const actionResponse = await submitContactAction(request, {
      name: tooLongName,
      email: 'valid@example.com',
      message: tooLongMessage,
    })

    expect(actionResponse.status()).toBe(400)

    const body = await actionResponse.json()
    expect(body).toMatchObject({
      type: 'AstroActionInputError',
      fields: {
        name: expect.any(Array),
        message: expect.any(Array),
      },
    })

    const inboxResponse = await request.get('/api/test/sent-emails/')
    const inbox = await inboxResponse.json()
    expect(inbox.emails).toHaveLength(0)
  })

  test('rejects email above zod upper boundary', async ({ request }) => {
    const tooLongEmail = `${'a'.repeat(250)}@a.com` // 256 chars total

    const actionResponse = await submitContactAction(request, {
      name: 'Valid Name',
      email: tooLongEmail,
      message: 'Valid message with enough length',
    })

    expect(actionResponse.status()).toBe(400)

    const body = await actionResponse.json()
    expect(body).toMatchObject({
      type: 'AstroActionInputError',
      fields: {
        email: expect.any(Array),
      },
    })

    const inboxResponse = await request.get('/api/test/sent-emails/')
    const inbox = await inboxResponse.json()
    expect(inbox.emails).toHaveLength(0)
  })
})
