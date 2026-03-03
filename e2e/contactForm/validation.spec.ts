import { test, expect } from '@playwright/test'
import { submitContactAction } from './helpers'

test.describe('Contact Form Modal - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.afterEach(async ({ request }) => {
    await request.get('/api/test/delete-emails/')
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
    const boundaryEmail = `${localPart}@${domainLabel}.com`
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
    const tooLongEmail = `${'a'.repeat(250)}@a.com`

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
