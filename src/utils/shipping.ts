import { getStripe } from '@services/stripe'
import { FREE_SHIPPING_THRESHOLD_EUR } from '@constants'

export async function getFreeShippingThreshold(): Promise<number> {
  const rateId = import.meta.env.STRIPE_SHIPPING_RATE_FREE
  if (!rateId) {
    return FREE_SHIPPING_THRESHOLD_EUR
  }

  let threshold: number | null = null

  try {
    const stripe = getStripe()
    const rate = await stripe.shippingRates.retrieve(rateId)
    const raw = rate.metadata?.['free-shipping-threshold']
    const parsed = raw ? parseFloat(raw) : NaN
    threshold = isNaN(parsed) ? FREE_SHIPPING_THRESHOLD_EUR : parsed
  } catch (err) {
    console.error('Failed to fetch free shipping threshold from Stripe:', err)
    threshold = FREE_SHIPPING_THRESHOLD_EUR
  }

  return threshold
}
