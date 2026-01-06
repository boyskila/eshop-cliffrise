import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { getProducts } from '@data/products'
import { getTranslations } from '@utils/i18'
import type { Product } from '@types'

export type CartItem = Product & {
  quantity: number
  metadata?: Record<string, string>
}

export const cart = {
  addToCart: defineAction({
    input: z.object({ productId: z.string(), lang: z.string() }),
    handler: async ({ productId, lang }, context) => {
      const cart = (await context.session?.get('cart')) ?? []
      const existingItem = cart.find((cartItem) => cartItem.id === productId)

      if (existingItem) {
        const next = cart.map((cartItem) => {
          return cartItem.id === productId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        })

        context.session?.set('cart', next)
        return { cart: next, addedItem: existingItem }
      }
      const product = getProducts(getTranslations({ lang })).find(
        (product) => product.id === productId
      )
      if (product) {
        const next = [...cart, { ...product, quantity: 1 }]
        context.session?.set('cart', next)
        return { cart: next, addedItem: product }
      }
      return {}
    },
  }),
  getCartCount: defineAction({
    handler: async (_, { session }) => {
      const cart = (await session?.get('cart')) ?? []
      return { count: cart.reduce((sum, i) => sum + i.quantity, 0) }
    },
  }),
  removeFromCart: defineAction({
    input: z.object({ productId: z.string() }),
    handler: async ({ productId }, { session }) => {
      const cart = (await session?.get('cart')) ?? []
      const nextCart = cart.filter((item) => item.id !== productId)
      await session?.set('cart', nextCart)
      return nextCart
    },
  }),
  updateQuantity: defineAction({
    input: z.object({ productId: z.string(), quantity: z.number() }),
    handler: async ({ productId, quantity }, { session }) => {
      const cart = (await session?.get('cart')) ?? []
      if (quantity < 0) {
        return cart
      }
      const nextCart = cart.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            quantity,
          }
        }
        return item
      })
      await session?.set('cart', nextCart)
      return nextCart
    },
  }),
}
