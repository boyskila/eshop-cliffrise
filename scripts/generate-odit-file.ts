import 'dotenv/config'
import * as fs from 'node:fs/promises'
import * as crypto from 'node:crypto'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const EIK = requiredEnv('EIK')
const E_SHOP_N = requiredEnv('E_SHOP_N')
const DOMAIN_NAME = requiredEnv('DOMAIN_NAME')
const E_SHOP_TYPE = process.env.E_SHOP_TYPE ?? '1'
const PAYMENT_CODE = process.env.PAYMENT_CODE ?? '6'
const REFUND_PAYMENT_CODE = process.env.REFUND_PAYMENT_CODE ?? '2'

type AuditOrder = {
  orderNumber: string
  orderDate: string
  documentNumber: number
  documentDate: string
  items: AuditItem[]
  totalNet: number
  discount: number
  vat: number
  totalGross: number
  paymentIntentId: string
  processorId: string
}

type AuditItem = {
  name: string
  quantity: number
  netPrice: number
  vatRate: number
  vat: number
  grossTotal: number
}

type AuditRefund = {
  orderNumber: string
  amount: number
  date: string
}

const DEFAULT_PRODUCT_NAME = 'Product'
const SHIPPING_ITEM_NAME = 'Shipping'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`)
  }
  return value
}

function toDateOnly(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().slice(0, 10)
}

function toAmount(amountInCents: number): number {
  return amountInCents / 100
}

function money(value: number): string {
  return value.toFixed(2)
}

function stringToIntDocNumber(input: string): number {
  // Create a hash of the input string and convert to a 10-digit integer
  const hash = crypto.createHash('sha256').update(input).digest('hex')
  const numericString = hash.replace(/[a-f]/g, (char) =>
    String(char.charCodeAt(0) % 10),
  )
  return Math.abs(parseInt(numericString.slice(0, 10), 10)) || 1000000000
}

function toDocumentNumber(input: string | undefined, fallback: string): number {
  if (!input) {
    return stringToIntDocNumber(fallback)
  }

  const numericInvoiceNumber = input.replace(/\D/g, '').slice(-10)
  const documentNumber = Number.parseInt(numericInvoiceNumber, 10)

  return documentNumber > 0 ? documentNumber : stringToIntDocNumber(input)
}

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function getPaymentIntentId(
  paymentIntent: Stripe.Checkout.Session['payment_intent'],
): string {
  if (!paymentIntent) {
    return ''
  }

  return typeof paymentIntent === 'string' ? paymentIntent : paymentIntent.id
}

async function getInvoiceNumber(
  invoice: Stripe.Checkout.Session['invoice'],
): Promise<string | undefined> {
  if (!invoice) {
    return undefined
  }

  if (typeof invoice !== 'string') {
    return invoice.number ?? undefined
  }

  const retrievedInvoice = await stripe.invoices.retrieve(invoice)

  return retrievedInvoice.number ?? undefined
}

function makeAuditItem(params: {
  name: string
  quantity: number
  grossTotalCents: number
  taxCents: number
}): AuditItem {
  const { name, quantity, grossTotalCents, taxCents } = params
  const grossTotal = toAmount(grossTotalCents)
  const vat = toAmount(taxCents)
  const netTotal = grossTotal - vat
  const netPrice = quantity > 0 ? netTotal / quantity : netTotal

  return {
    name,
    quantity,
    netPrice,
    vatRate: vat > 0 ? 20 : 0,
    vat,
    grossTotal,
  }
}

function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0))

  return {
    startUnix: Math.floor(start.getTime() / 1000),
    endUnix: Math.floor(end.getTime() / 1000),
  }
}

async function getPaidCheckoutSessions(year: number, month: number) {
  const { startUnix, endUnix } = getMonthRange(year, month)

  const sessions: Stripe.Checkout.Session[] = []

  for await (const session of stripe.checkout.sessions.list({
    limit: 100,
    status: 'complete',
    created: {
      gte: startUnix,
      lt: endUnix,
    },
    expand: ['data.payment_intent', 'data.invoice'],
  })) {
    if (session.payment_status === 'paid') {
      sessions.push(session)
    }
  }

  return sessions
}

async function getSessionLineItems(sessionId: string) {
  const items: Stripe.LineItem[] = []

  for await (const item of stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
  })) {
    items.push(item)
  }

  return items
}

async function buildOrders(year: number, month: number): Promise<AuditOrder[]> {
  const sessions = await getPaidCheckoutSessions(year, month)
  const orders: AuditOrder[] = []

  for (const session of sessions) {
    const lineItems = await getSessionLineItems(session.id)

    const orderNumber =
      session.metadata?.orderId || session.client_reference_id || session.id

    const paymentIntentId = getPaymentIntentId(session.payment_intent)

    const invoiceNumber = await getInvoiceNumber(session.invoice)

    const documentNumber = toDocumentNumber(
      invoiceNumber,
      paymentIntentId || session.id,
    )

    const processorId = paymentIntentId

    const items: AuditItem[] = lineItems.map((item) =>
      makeAuditItem({
        name: item.description || DEFAULT_PRODUCT_NAME,
        quantity: item.quantity ?? 1,
        grossTotalCents: item.amount_total ?? 0,
        taxCents: item.amount_tax ?? 0,
      }),
    )

    const shippingTotal = session.shipping_cost?.amount_total ?? 0
    if (shippingTotal > 0) {
      items.push(
        makeAuditItem({
          name: SHIPPING_ITEM_NAME,
          quantity: 1,
          grossTotalCents: shippingTotal,
          taxCents: session.shipping_cost?.amount_tax ?? 0,
        }),
      )
    }

    const totalGross = toAmount(session.amount_total ?? 0)
    const totalNet = items.reduce(
      (sum, item) => sum + item.netPrice * item.quantity,
      0,
    )
    const vat = items.reduce((sum, item) => sum + item.vat, 0)

    const totalDiscount = toAmount(session.total_details?.amount_discount ?? 0)

    orders.push({
      orderNumber,
      orderDate: toDateOnly(session.created),
      documentNumber,
      documentDate: toDateOnly(session.created),
      items,
      totalNet,
      discount: totalDiscount,
      vat,
      totalGross,
      paymentIntentId,
      processorId,
    })
  }

  return orders
}

async function buildRefunds(
  year: number,
  month: number,
): Promise<AuditRefund[]> {
  const { startUnix, endUnix } = getMonthRange(year, month)
  const refunds: AuditRefund[] = []

  for await (const refund of stripe.refunds.list({
    limit: 100,
    created: {
      gte: startUnix,
      lt: endUnix,
    },
  })) {
    if (refund.status === 'canceled' || refund.status === 'failed') {
      continue
    }

    const paymentIntentId =
      typeof refund.payment_intent === 'string'
        ? refund.payment_intent
        : refund.payment_intent?.id

    let orderNumber = paymentIntentId || refund.id

    if (paymentIntentId) {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      })

      const session = sessions.data[0]

      orderNumber =
        session?.metadata?.orderId ||
        session?.client_reference_id ||
        session?.id ||
        paymentIntentId
    }

    refunds.push({
      orderNumber,
      amount: toAmount(refund.amount),
      date: toDateOnly(refund.created),
    })
  }

  return refunds
}

function generateXml(params: {
  year: number
  month: number
  orders: AuditOrder[]
  refunds: AuditRefund[]
}) {
  const { year, month, orders, refunds } = params
  const monthString = String(month).padStart(2, '0')
  const creationDate = new Date().toISOString().slice(0, 10)

  const ordersXml = orders
    .map((order) => {
      const itemsXml = order.items
        .map(
          (item) => `
        <artenum>
          <art_name>${xmlEscape(item.name)}</art_name>
          <art_quant>${item.quantity}</art_quant>
          <art_price>${money(item.netPrice)}</art_price>
          <art_vat_rate>${item.vatRate}</art_vat_rate>
          <art_vat>${money(item.vat)}</art_vat>
          <art_sum>${money(item.grossTotal)}</art_sum>
        </artenum>`,
        )
        .join('')

      return `
      <orderenum>
        <ord_n>${xmlEscape(order.orderNumber)}</ord_n>
        <ord_d>${order.orderDate}</ord_d>
        <doc_n>${order.documentNumber}</doc_n>
        <doc_date>${order.documentDate}</doc_date>
        <art>${itemsXml}
        </art>
        <ord_total1>${money(order.totalNet)}</ord_total1>
        <ord_disc>${money(order.discount)}</ord_disc>
        <ord_vat>${money(order.vat)}</ord_vat>
        <ord_total2>${money(order.totalGross)}</ord_total2>
        <paym>${PAYMENT_CODE}</paym>
        <pos_n/>
        <trans_n>${xmlEscape(order.paymentIntentId)}</trans_n>
        <proc_id>${xmlEscape(order.processorId)}</proc_id>
      </orderenum>`
    })
    .join('')

  const refundsXml = refunds
    .map(
      (refund) => `
      <rorderenum>
        <r_ord_n>${xmlEscape(refund.orderNumber)}</r_ord_n>
        <r_amount>${money(refund.amount)}</r_amount>
        <r_date>${refund.date}</r_date>
        <r_paym>${REFUND_PAYMENT_CODE}</r_paym>
      </rorderenum>`,
    )
    .join('')

  const refundTotal = refunds.reduce((sum, refund) => sum + refund.amount, 0)

  return `<?xml version="1.0" encoding="UTF-8"?>
<audit>
  <eik>${xmlEscape(EIK)}</eik>
  <e_shop_n>${xmlEscape(E_SHOP_N)}</e_shop_n>
  <domain_name>${xmlEscape(DOMAIN_NAME)}</domain_name>
  <e_shop_type>${xmlEscape(E_SHOP_TYPE)}</e_shop_type>
  <creation_date>${creationDate}</creation_date>
  <mon>${monthString}</mon>
  <god>${year}</god>
  <order>${ordersXml}
  </order>
  <r_ord>${refunds.length}</r_ord>
  <rorder>${refundsXml}
  </rorder>
  <r_total>${money(refundTotal)}</r_total>
</audit>
`
}

async function main() {
  const year = Number(process.argv[2])
  const month = Number(process.argv[3])

  if (!year || !month || month < 1 || month > 12) {
    throw new Error('Usage: npx tsx scripts/generate-odit-file.ts 2026 5')
  }

  const orders = await buildOrders(year, month)
  const refunds = await buildRefunds(year, month)

  const xml = generateXml({
    year,
    month,
    orders,
    refunds,
  })

  const fileName = `audit-${year}-${String(month).padStart(2, '0')}.xml`

  await fs.writeFile(fileName, xml, 'utf8')

  console.log(`Generated ${fileName}`)
  console.log(`Orders: ${orders.length}`)
  console.log(`Refunds: ${refunds.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
