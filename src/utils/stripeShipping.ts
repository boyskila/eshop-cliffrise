import { getStripe } from '@services/stripe'

type ShippingRateKind = 'free' | 'standard'

const shippingRateEnvByKind: Record<ShippingRateKind, string> = {
  free: 'STRIPE_SHIPPING_RATE_FREE',
  standard: 'STRIPE_SHIPPING_RATE_STANDARD',
}

export const getStripeShippingRateId = (kind: ShippingRateKind) => {
  const envName = shippingRateEnvByKind[kind]
  const rateId = import.meta.env[envName]

  if (!rateId) {
    throw new Error(`${envName} is not set`)
  }

  return rateId
}

export const getStripeShippingRate = async (kind: ShippingRateKind) => {
  const stripe = getStripe()
  const rate = await stripe.shippingRates.retrieve(getStripeShippingRateId(kind))
  const amount = rate.fixed_amount?.amount
  const currency = rate.fixed_amount?.currency

  if (amount === null || amount === undefined || currency !== 'eur') {
    throw new Error(`Stripe shipping rate "${rate.id}" must be fixed in EUR`)
  }

  return {
    id: rate.id,
    amountEur: amount / 100,
    metadata: rate.metadata,
  }
}
