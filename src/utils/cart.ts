import type { CartItem } from '@actions'

export const getCartCount = (cart: CartItem[] = []) => {
  return cart.reduce((sum, { quantity }) => sum + quantity, 0)
}
