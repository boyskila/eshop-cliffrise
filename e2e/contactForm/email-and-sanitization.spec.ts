import { test, expect } from '@playwright/test'
import { openContactFormModal, submitContactAction } from './helpers'

test.describe('Contact Form Modal - Email And Sanitization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/')
  })

  test.afterEach(async ({ request }) => {
    await request.get('/api/test/delete-emails/')
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

    await expect
      .poll(
        async () => {
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
      to: 'CliffRise <hello@cliffrise.com>',
      replyTo: 'test@example.com',
      subject: '[CliffRise] New message from Test User',
      html: expect.stringContaining(
        'This is a test message for email verification',
      ),
    })
    expect(data.emails[0].html).toContain('<strong>Name:</strong> Test User')
    expect(data.emails[0].html).toContain(
      '<strong>Email:</strong> test@example.com',
    )
  })

  test('renders contact email template with expected fields', async ({
    request,
  }) => {
    const actionResponse = await submitContactAction(request, {
      name: 'Template Tester',
      email: 'template@example.com',
      message: 'Please verify the email template.\nThanks!',
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
    const { emails } = await inboxResponse.json()
    const email = emails[0]
    const html = email.html.replace(/\s+/g, ' ').trim()

    expect(email).toMatchObject({
      from: 'CliffRise <hello@cliffrise.com>',
      to: 'CliffRise <hello@cliffrise.com>',
      replyTo: 'template@example.com',
      subject: '[CliffRise] New message from Template Tester',
      bcc: ['rise@cliffrise.com'],
    })

    expect(html).toContain('<!doctype html> <html lang="en">')
    expect(html).toContain(
      '<body style="font-family: Arial, sans-serif; color: #1f2933; line-height: 1.5;">',
    )
    expect(html).toContain(
      '<h1 style="font-size: 20px; margin: 0 0 16px;">New contact form message</h1>',
    )
    expect(html).toContain(
      '<p style="margin: 0 0 8px;"><strong>Name:</strong> Template Tester</p>',
    )
    expect(html).toContain(
      '<p style="margin: 0 0 16px;"><strong>Email:</strong> template@example.com</p>',
    )
    expect(html).toContain(
      '<strong>Message:</strong> <p style="margin: 8px 0 0;">Please verify the email template.<br>Thanks!</p>',
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
      '[CliffRise] New message from &lt;b&gt;Test User&lt;&#x2F;b&gt;',
    )
    expect(email.replyTo).toBe('test@example.com')
    expect(email.html).toContain(
      'Hello &lt;script&gt;alert(1)&lt;&#x2F;script&gt;<br>Line 2',
    )
    expect(email.html).not.toContain('<script>')
  })

  test('converts newlines to <br> in email message', async ({ request }) => {
    const actionResponse = await submitContactAction(request, {
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Line one\nLine two\nLine three',
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
    const { emails } = await inboxResponse.json()
    expect(emails[0].html).toContain('Line one<br>Line two<br>Line three')
  })

  test('sends maximum length contact message', async ({ request }) => {
    const maxMessage = 'L'.repeat(5000)
    const actionResponse = await submitContactAction(request, {
      name: 'Long Message Sender',
      email: 'long@example.com',
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

    const inboxResponse = await request.get('/api/test/sent-emails/')
    const { emails } = await inboxResponse.json()

    expect(emails[0].html).toContain(maxMessage)
  })
})
