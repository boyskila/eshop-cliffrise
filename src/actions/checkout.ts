import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { getStripe } from '@services/stripe'

export const checkout = {
  saveShipping: defineAction({
    input: z.object({
      courier: z.enum(['speedy']),
      name: z.string().min(1),
      phone: z.string().min(1),
      office: z.string().min(1),
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
