import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { getStripe } from '@services/stripe'
import { calculateShippingFee } from '@utils/speedy'

export const checkout = {
  calculateShipping: defineAction({
    input: z.object({
      officeId: z.coerce.number(),
      totalWeight: z.coerce.number().optional(),
    }),
    handler: async ({ officeId, totalWeight }) => {
      const fee = await calculateShippingFee(officeId, totalWeight ?? 1)
      return { fee }
    },
  }),
  saveShipping: defineAction({
    input: z.object({
      office: z.string().min(1),
      officeId: z.coerce.number(),
    }),
    handler: async (input, context) => {
      context.session?.set('shipping', input)
      return { success: true }
    },
  }),
  getCheckoutStatus: defineAction({
    input: z.object({
      sessionId: z.string(),
    }),
    handler: async ({ sessionId }, context) => {
      const stripe = getStripe()
      const session = await stripe.checkout.sessions.retrieve(sessionId)

      if (session.status === 'complete') {
        context.session?.set('cart', [])
      }

      return {
        status: session.status,
        customerEmail: session.customer_details?.email ?? null,
      }
    },
  }),
}
