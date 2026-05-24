import { getStripeShippingRate } from '@utils/stripeShipping'

const FREE_SHIPPING_THRESHOLD_METADATA_KEY = 'shipping_free_threshold'

export const getFreeShippingThreshold = async () => {
  const shippingRate = await getStripeShippingRate('standard')
  const raw = shippingRate.metadata[FREE_SHIPPING_THRESHOLD_METADATA_KEY]
  const threshold = raw ? parseFloat(raw) : NaN

  if (!Number.isFinite(threshold)) {
    throw new Error(
      `Stripe shipping rate "${shippingRate.id}" metadata.${FREE_SHIPPING_THRESHOLD_METADATA_KEY} must be a number`,
    )
  }

  return threshold
}
