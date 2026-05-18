import type { APIRoute } from 'astro'
import type Stripe from 'stripe'
import { getStripe } from '@services/stripe'
import { emailService } from '@services/email'
import { getTranslations } from '@utils/i18'
import { escapeHtml, formatPrice, isPresent, isTestMode } from '@utils/func'
import type { Locale } from '@types'

type EmailLineItem = {
  name: string
  quantity: number
  amount: number
  currency: string
}

const getSessionLineItems = async (
  session: Stripe.Checkout.Session,
): Promise<EmailLineItem[]> => {
  if (session.line_items?.data?.length) {
    return session.line_items.data.map((item) => ({
      name: item.description ?? 'Product',
      quantity: item.quantity ?? 1,
      amount: item.amount_total ?? 0,
      currency: item.currency ?? session.currency ?? 'eur',
    }))
  }

  const stripe = getStripe()
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
  })

  return lineItems.data.map((item) => ({
    name: item.description ?? 'Product',
    quantity: item.quantity ?? 1,
    amount: item.amount_total ?? 0,
    currency: item.currency ?? session.currency ?? 'eur',
  }))
}

const buildProductsText = (items: EmailLineItem[], lang: Locale) => {
  return items
    .map((item) => {
      const amount = formatPrice(
        item.amount / 100,
        lang,
        item.currency.toUpperCase(),
      )
      return `${escapeHtml(item.name)} x ${item.quantity} - ${amount}`
    })
    .join('\n')
}

const getMetadataProductsText = (metadata?: Stripe.Metadata | null) => {
  const productCount = Number(metadata?.product_count ?? 0)
  const products = Array.from({ length: productCount }, (_, index) => {
    return metadata?.[`product_${index + 1}`]
  }).filter((product): product is string => Boolean(product))

  return products.length > 0 ? escapeHtml(products.join('\n')) : ''
}

const getProductsText = async (
  session: Stripe.Checkout.Session,
  lang: Locale,
) => {
  const metadataProducts = getMetadataProductsText(session.metadata)
  if (metadataProducts) {
    return metadataProducts
  }

  if (session.metadata?.products) {
    return escapeHtml(session.metadata.products)
  }

  try {
    const lineItems = await getSessionLineItems(session)
    return buildProductsText(lineItems, lang)
  } catch (err) {
    console.error('Failed to load Stripe line items:', err)
    return ''
  }
}

const buildEmailVariables = async (
  session: Stripe.Checkout.Session,
): Promise<Record<string, string>> => {
  const lang = session.metadata?.lang as Locale
  const translations = getTranslations({ lang })
  const t = translations.email
  const name = escapeHtml(session.customer_details?.name ?? 'Customer')
  const amount = ((session.amount_total ?? 0) / 100).toFixed(2)
  const currency = (session.currency ?? 'EUR').toUpperCase()
  const products = await getProductsText(session, lang)
  if (!products) {
    console.error('Order confirmation email has no products', {
      sessionId: session.id,
      metadataKeys: Object.keys(session.metadata ?? {}),
      hasExpandedLineItems: Boolean(session.line_items?.data?.length),
    })
  }

  const shippingFeeRaw = parseFloat(session.metadata?.shipping_fee ?? '0')
  const shippingFeeDisplay =
    shippingFeeRaw > 0 ? `${formatPrice(shippingFeeRaw, lang)}` : t.freeShipping
  const discountRaw = (session.total_details?.amount_discount ?? 0) / 100
  const discountDisplay =
    discountRaw > 0 ? `-${formatPrice(discountRaw, lang, currency)}` : ''
  const productsAmount = (
    isPresent(session.amount_subtotal)
      ? (session.amount_subtotal ?? 0) / 100
      : (session.amount_total ?? 0) / 100 - shippingFeeRaw + discountRaw
  ).toFixed(2)
  return {
    storeName: 'CLIFFRISE',
    orderConfirmedHeading: t.orderConfirmedHeading,
    greeting: `${t.greeting} ${name} 👋`,
    thankYou: t.thankYou.replace('{name}', name),
    orderReferenceLabel: t.orderReference,
    sessionId: `#${session.id.slice(-8).toUpperCase()}`,
    itemsHeading: t.itemsHeading,
    products,
    productsAmountLabel: t.productsAmount,
    productsAmount,
    discountLine: discountRaw > 0 ? `${t.discount} ${discountDisplay}` : '',
    totalLabel: t.total,
    amount,
    currency,
    shippingHeading: t.shippingHeading,
    courierDelivery: t.courierDelivery,
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

  let event: Stripe.Event

  if (isTestMode) {
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
    let session = event.data.object as Stripe.Checkout.Session
    if (!isTestMode) {
      const stripe = getStripe()
      session = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      })
    }
    const customerEmail = session.customer_details?.email
    const lang = session.metadata?.lang as Locale
    const t = getTranslations({ lang }).email

    if (customerEmail) {
      const result = await emailService.get().send({
        from: import.meta.env.OWNER_EMAIL,
        to: customerEmail,
        bcc: [import.meta.env.BCC_EMAIL],
        subject: t.orderConfirmedSubject,
        template: {
          id: import.meta.env.RESEND_TEMPLATE_ID,
          variables: await buildEmailVariables(session),
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
