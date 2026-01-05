import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { getProducts } from '@data/products'
import type { Product } from '@types'
import { getTranslations } from '@utils/i18'

export type CartItem = Product & {
  quantity: number
  metadata?: Record<string, string>
}

export const server = {
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
        return { cart, addedItem: existingItem }
      }
      const product = getProducts(getTranslations({ lang })).find(
        (product) => product.id === productId
      )
      if (product) {
        const next = [...cart, { ...product, quantity: 1 }]
        context.session?.set('cart', next)
        return { cart, addedItem: product }
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
}
