import type { CartItem } from '@actions'

export const getCartCount = (cart: CartItem[] = []) => {
  return cart.reduce((sum, { quantity }) => sum + quantity, 0)
}

export const getTotalPrice = (cart: CartItem[]) => {
  return cart.reduce((sum, { price, quantity }) => {
    return sum + price * quantity
  }, 0)
}
