const DEFAULT_THRESHOLD = 30

export const getFreeShippingThreshold = () => {
  const raw = import.meta.env.FREE_SHIPPING_THRESHOLD
  const parsed = raw ? parseFloat(raw) : NaN
  return isNaN(parsed) ? DEFAULT_THRESHOLD : parsed
}
