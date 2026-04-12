import type { APIRoute } from 'astro'
import type Stripe from 'stripe'
import { getStripe } from '@services/stripe'
import { emailService } from '@services/email'
import { getTranslations } from '@utils/i18'
import { escapeHtml } from '@utils/func'

const buildEmailVariables = (
  session: Stripe.Checkout.Session,
): Record<string, string> => {
  const lang = session.metadata?.lang
  const t = getTranslations({ lang }).email
  const name = escapeHtml(session.customer_details?.name ?? 'Customer')
  const amount = ((session.amount_total ?? 0) / 100).toFixed(2)
  const currency = (session.currency ?? 'EUR').toUpperCase()

  const shippingFeeRaw = parseFloat(session.metadata?.shipping_fee ?? '0')
  const shippingFeeDisplay =
    shippingFeeRaw > 0 ? `€${shippingFeeRaw.toFixed(2)}` : t.freeShipping
  const productsAmount = (
    (session.amount_total ?? 0) / 100 -
    shippingFeeRaw
  ).toFixed(2)

  return {
    storeName: 'CLIFFRISE',
    orderConfirmedHeading: t.orderConfirmedHeading,
    greeting: `${t.greeting} ${name} 👋`,
    thankYou: t.thankYou.replace('{name}', name),
    orderReferenceLabel: t.orderReference,
    sessionId: `#${session.id.slice(-8).toUpperCase()}`,
    productsAmountLabel: t.productsAmount,
    productsAmount,
    totalLabel: t.total,
    amount,
    currency,
    shippingHeading: t.shippingHeading,
    recipientLabel: t.recipient,
    shippingName: escapeHtml(session.customer_details?.name ?? ''),
    phoneLabel: t.phone,
    shippingPhone: escapeHtml(session.customer_details?.phone ?? ''),
    officeLabel: t.office,
    shippingOffice: escapeHtml(session.metadata?.shipping_office ?? ''),
    shippingFeeLabel: t.shippingFee,
    shippingFee: shippingFeeDisplay,
    supportMessage: t.supportMessage,
    copyright: `© ${new Date().getFullYear()} Cliffrise. ${t.allRightsReserved}`,
  }
}

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text()
  const isTest = import.meta.env.MODE === 'test'

  let event: Stripe.Event

  if (isTest) {
    try {
      event = JSON.parse(body) as Stripe.Event
    } catch {
      return new Response('Invalid JSON', { status: 400 })
    }
  } else {
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret || !signature) {
      return new Response('Missing webhook configuration', { status: 400 })
    }

    try {
      const stripe = getStripe()
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerEmail = session.customer_details?.email
    const lang = session.metadata?.lang
    const t = getTranslations({ lang }).email

    if (customerEmail) {
      const result = await emailService.get().send({
        from: import.meta.env.OWNER_EMAIL,
        to: customerEmail,
        bcc: [import.meta.env.BCC_EMAIL_ONE, import.meta.env.BCC_EMAIL_TWO],
        subject: t.orderConfirmedSubject,
        template: {
          id: import.meta.env.RESEND_TEMPLATE_ID,
          variables: buildEmailVariables(session),
        },
      })

      if (!result.success) {
        console.error('Order confirmation email failed:', result.error)
      }
    } else {
      console.error('Order confirmation email skipped: missing customer email')
    }
  }

  return new Response(null, { status: 200 })
}
