import { test, expect } from '@playwright/test'
import { submitContactAction } from './helpers'

test.describe('Contact Form Modal - Rate Limit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.afterEach(async ({ request }) => {
    await request.get('/api/test/delete-emails/')
  })

  test('rate limits repeated submissions from same IP', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      const actionResponse = await submitContactAction(request, {
        name: `Rate Limit User ${i}`,
        email: `ratelimit${i}@example.com`,
        message: `Valid message for rate limit test ${i}`,
      })
      expect(actionResponse.ok()).toBeTruthy()
    }

    await expect
      .poll(
        async () => {
          const response = await request.get('/api/test/sent-emails/')
          const { emails } = await response.json()
          return emails.length
        },
        { timeout: 5000 },
      )
      .toBe(3)

    const limitedResponse = await submitContactAction(request, {
      name: 'Rate Limit User Blocked',
      email: 'blocked@example.com',
      message: 'This request should be blocked by limiter',
    })

    expect(limitedResponse.status()).toBe(429)

    const limitedBody = await limitedResponse.json()
    expect(limitedBody).toMatchObject({
      type: 'AstroActionError',
      code: 'TOO_MANY_REQUESTS',
    })

    const inboxResponse = await request.get('/api/test/sent-emails/')
    const { emails } = await inboxResponse.json()
    expect(emails).toHaveLength(3)
  })
})
