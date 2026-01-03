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
    input: z.object({ productId: z.string() }),
    handler: async ({ productId }, context) => {
      const cart = (await context.session?.get('cart')) ?? []
      const existingItem = cart.find((cartItem) => cartItem.id === productId)

      if (existingItem) {
        const next = cart.map((cartItem) => {
          return cartItem.id === productId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        })

        context.session?.set('cart', next)
        return next
      }
      const product = getProducts(getTranslations()).find(
        (product) => product.id === productId
      )
      if (product) {
        const next = [...cart, { ...product, quantity: 1 }]
        context.session?.set('cart', next)
        return next
      }
      return []
    },
  }),
}
