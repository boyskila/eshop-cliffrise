import { getStripe } from '@services/stripe'
import {
  STRIPE_SHIPPING_RATE_FREE,
  STRIPE_SHIPPING_RATE_STANDARD,
} from 'astro:env/server'

type ShippingRateKind = 'free' | 'standard'

const shippingRateByKind: Record<ShippingRateKind, string> = {
  free: STRIPE_SHIPPING_RATE_FREE,
  standard: STRIPE_SHIPPING_RATE_STANDARD,
}

export const getStripeShippingRateId = (kind: ShippingRateKind) =>
  shippingRateByKind[kind]

export const getStripeShippingRate = async (kind: ShippingRateKind) => {
  const stripe = getStripe()
  const rate = await stripe.shippingRates.retrieve(
    getStripeShippingRateId(kind),
  )
  const amount = rate.fixed_amount?.amount
  const currency = rate.fixed_amount?.currency
  const bgnPrice = rate.metadata.bgn_price
    ? parseFloat(rate.metadata.bgn_price)
    : undefined

  if (amount === null || amount === undefined || currency !== 'eur') {
    throw new Error(`Stripe shipping rate "${rate.id}" must be fixed in EUR`)
  }

  if (bgnPrice !== undefined && !Number.isFinite(bgnPrice)) {
    throw new Error(
      `Stripe shipping rate "${rate.id}" metadata.bgn_price must be a number`,
    )
  }

  return {
    id: rate.id,
    amountEur: amount / 100,
    amountBgn: bgnPrice,
    metadata: rate.metadata,
  }
}
