import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { getStripe } from '@services/stripe'
import { getStripeShippingRate } from '@utils/stripeShipping'

export const checkout = {
  getShippingRate: defineAction({
    input: z.object({
      officeId: z.coerce.number(),
    }),
    handler: async () => {
      const { amountEur: fee, amountBgn: feeBgn } =
        await getStripeShippingRate('standard')
      return { fee, feeBgn }
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
