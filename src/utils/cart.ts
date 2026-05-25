import type { CartItem } from '@actions'
import { isPresent } from './func'

export const getCartCount = (cart: CartItem[] = []) => {
  return cart.reduce((sum, { quantity }) => sum + quantity, 0)
}

export const getTotalPrice = (cart: CartItem[]) => {
  return cart.reduce((sum, { price, quantity }) => {
    return sum + price * quantity
  }, 0)
}

export const getTotalPriceBgn = (cart: CartItem[]) => {
  if (cart.some(({ priceBgn }) => !isPresent(priceBgn))) {
    return undefined
  }

  return cart.reduce((sum, { priceBgn, quantity }) => {
    return sum + priceBgn! * quantity
  }, 0)
}

export const getTotalWeight = (cart: CartItem[]) => {
  return cart.reduce((sum, { weight, quantity }) => {
    return sum + (weight || 0) * quantity
  }, 0)
}
