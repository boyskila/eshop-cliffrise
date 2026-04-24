import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { getProducts } from '@data/products'
import type { Product } from '@types'
import { isString } from '@utils/func'

export type CartItem = Product & {
  quantity: number
  metadata?: Record<string, string>
}

export const cart = {
  addToCart: defineAction({
    input: z.object({
      productId: z.string(),
      lang: z.string(),
      kind: z.string().optional(),
      quantity: z.number().optional().default(1),
    }),
    handler: async ({ productId, lang, kind, quantity }, context) => {
      const cart = (await context.session?.get('cart')) ?? []
      const cartItemId = kind ? `${productId}:${kind}` : productId
      const existingItem = cart.find((cartItem) => cartItem.id === cartItemId)

      if (existingItem) {
        const next = cart.map((cartItem) => {
          return cartItem.id === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        })

        context.session?.set('cart', next)
        return { cart: next, addedItem: existingItem }
      }
      const product = (await getProducts(lang)).find(
        (product) => product.id === productId,
      )
      if (product) {
        const selectedKind = kind
          ? product.kind.find((productKind) => productKind.name === kind)
          : undefined
        const rawImage = selectedKind?.image ?? product.image
        const nextItem = {
          ...product,
          id: cartItemId,
          name: selectedKind
            ? `${product.name} (${selectedKind.name})`
            : product.name,
          image: isString(rawImage) ? rawImage : rawImage.src,
          metadata: kind ? { kind, productId } : undefined,
          quantity: quantity,
        }
        const next = [...cart, nextItem]
        context.session?.set('cart', next)
        return { cart: next, addedItem: nextItem }
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
