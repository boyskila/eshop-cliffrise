import { test, expect } from '@playwright/test'

const makeSessionCompletedEvent = (
  overrides: Partial<{
    id: string
    amount_total: number
    currency: string
    customer_name: string
    customer_email: string | null
    customer_phone: string
  }> = {},
) => ({
  type: 'checkout.session.completed',
  data: {
    object: {
      id: overrides.id ?? 'cs_test_123',
      object: 'checkout.session',
      status: 'complete',
      amount_total: overrides.amount_total ?? 2999,
      currency: overrides.currency ?? 'eur',
      customer_details:
        overrides.customer_email !== null
          ? {
              email: overrides.customer_email ?? 'customer@example.com',
              name: overrides.customer_name ?? 'Test Customer',
              phone: overrides.customer_phone ?? null,
              address: null,
            }
          : null,
      metadata: {},
    },
  },
})

test.describe('Stripe Webhook - Order Confirmation Email', () => {
  test.afterEach(async ({ request }) => {
    await request.get('/api/test/delete-emails/')
  })

  test('sends a single customer confirmation with owners in bcc on checkout.session.completed', async ({
    request,
  }) => {
    const response = await request.post('/api/webhooks/stripe/', {
      data: makeSessionCompletedEvent(),
    })

    expect(response.ok()).toBeTruthy()

    await expect
      .poll(
        async () => {
          const res = await request.get('/api/test/sent-emails/')
          const data = await res.json()
          return data.emails
        },
        {
          message: 'Expected one customer email after webhook',
          timeout: 5000,
        },
      )
      .toHaveLength(1)

    const res = await request.get('/api/test/sent-emails/')
    const { emails } = await res.json()

    const customerEmail = emails.find(
      (e: { to: string }) => e.to === 'customer@example.com',
    )
    expect(customerEmail).toMatchObject({
      to: 'customer@example.com',
      subject: 'Order Confirmed – CliffRise',
      from: 'CliffRise Orders <onboarding@resend.dev>',
    })
    expect(customerEmail.bcc).toEqual([
      'tancheva.design@gmail.com',
      'boiskila@gmail.com',
    ])
    expect(customerEmail.html).toContain('Test Customer')
    expect(customerEmail.html).toContain('29.99 EUR')
    expect(customerEmail.html).toContain('cs_test_123')
  })

  test('bccs both owner inboxes on customer confirmation', async ({
    request,
  }) => {
    const response = await request.post('/api/webhooks/stripe/', {
      data: makeSessionCompletedEvent({
        id: 'cs_test_owner_456',
        amount_total: 4999,
        currency: 'eur',
        customer_name: 'Jane Doe',
        customer_email: 'jane@example.com',
        customer_phone: '+359888123456',
      }),
    })

    expect(response.ok()).toBeTruthy()

    await expect
      .poll(
        async () => {
          const res = await request.get('/api/test/sent-emails/')
          const data = await res.json()
          return data.emails
        },
        { timeout: 5000 },
      )
      .toHaveLength(1)

    const res = await request.get('/api/test/sent-emails/')
    const { emails } = await res.json()

    const customerEmail = emails[0]
    expect(customerEmail).toMatchObject({
      to: 'jane@example.com',
      subject: 'Order Confirmed – CliffRise',
      from: 'CliffRise Orders <onboarding@resend.dev>',
    })
    expect(customerEmail.bcc).toEqual([
      'tancheva.design@gmail.com',
      'boiskila@gmail.com',
    ])
    expect(customerEmail.html).toContain('cs_test_owner_456')
    expect(customerEmail.html).toContain('49.99 EUR')
    expect(customerEmail.html).toContain('Jane Doe')
  })

  test('sends no email when customer_details is null', async ({
    request,
  }) => {
    const response = await request.post('/api/webhooks/stripe/', {
      data: makeSessionCompletedEvent({ customer_email: null }),
    })

    expect(response.ok()).toBeTruthy()

    await expect
      .poll(
        async () => {
          const res = await request.get('/api/test/sent-emails/')
          const data = await res.json()
          return data.emails
        },
        { timeout: 5000 },
      )
      .toHaveLength(0)
  })

  test('returns 200 and sends no email for unhandled event types', async ({
    request,
  }) => {
    const response = await request.post('/api/webhooks/stripe/', {
      data: { type: 'payment_intent.created', data: { object: { id: 'pi_test_123' } } },
    })

    expect(response.ok()).toBeTruthy()

    const res = await request.get('/api/test/sent-emails/')
    const { emails } = await res.json()
    expect(emails).toHaveLength(0)
  })

  test('escapes HTML in the confirmation email', async ({ request }) => {
    const response = await request.post('/api/webhooks/stripe/', {
      data: makeSessionCompletedEvent({
        customer_name: '<script>alert(1)</script>',
        customer_email: 'xss@example.com',
      }),
    })

    expect(response.ok()).toBeTruthy()

    await expect
      .poll(
        async () => {
          const res = await request.get('/api/test/sent-emails/')
          const data = await res.json()
          return data.emails
        },
        { timeout: 5000 },
      )
      .toHaveLength(1)

    const res = await request.get('/api/test/sent-emails/')
    const { emails } = await res.json()

    expect(emails[0].html).not.toContain('<script>')
    expect(emails[0].html).toContain('&lt;script&gt;')
  })

  test('returns 400 for invalid JSON body', async ({ request }) => {
    const response = await request.post('/api/webhooks/stripe/', {
      headers: { 'Content-Type': 'application/json' },
      data: Buffer.from('not valid json{{{'),
    })

    expect(response.status()).toBe(400)
  })
})
