import { test, expect } from '@playwright/test'
import { openContactFormModal, submitContactAction } from './helpers'

test.describe('Contact Form Modal - Email And Sanitization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
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
      to: 'test@example.com',
      subject: '[CliffRise] New message from Test User',
      replyTo: 'test@example.com',
      template: {
        variables: {
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message for email verification',
        },
      },
    })
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
    expect(email.template.variables.message).toContain(
      'Hello &lt;script&gt;alert(1)&lt;&#x2F;script&gt;<br>Line 2',
    )
    expect(email.template.variables.message).not.toContain('<script>')
  })

  test('honeypot field prevents email from being sent', async ({ request }) => {
    const actionResponse = await submitContactAction(request, {
      name: 'Bot',
      email: 'bot@spam.com',
      message: 'Buy my stuff now!!!',
      company: 'SpamCo',
    })

    expect(actionResponse.ok()).toBeTruthy()

    const inboxResponse = await request.get('/api/test/sent-emails/')
    const { emails } = await inboxResponse.json()
    expect(emails).toHaveLength(0)
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
    expect(emails[0].template.variables.message).toBe(
      'Line one<br>Line two<br>Line three',
    )
  })
})
