import { createSignal, Show, onMount, onCleanup } from 'solid-js'
import { loadStripe } from '@stripe/stripe-js'
import type { Locale } from '@types'

type Props = {
  stripePublicKey: string
  clientSecret: string
  lang: Locale
  text: {
    loading: string
    error: string
    retry: string
  }
}

export const StripeCheckout = (props: Props) => {
  const [error, setError] = createSignal<string | null>(null)
  const [loading, setLoading] = createSignal(true)
  let checkoutContainer: HTMLDivElement | undefined

  onMount(async () => {
    try {
      const stripe = await loadStripe(props.stripePublicKey)
      if (!stripe) {
        setError(props.text.error)
        setLoading(false)
        return
      }

      const checkout = await stripe.createEmbeddedCheckoutPage({
        clientSecret: props.clientSecret,
      })

      if (checkoutContainer) {
        checkout.mount(checkoutContainer)
        setLoading(false)
      }

      onCleanup(() => {
        checkout.destroy()
      })
    } catch {
      setError(props.text.error)
      setLoading(false)
    }
  })

  return (
    <div class="w-[90%] m-auto">
      <Show when={error()}>
        <div class="text-center py-12">
          <p class="text-red-600 text-lg mb-4">{error()}</p>
          <a
            href={`/${props.lang}/`}
            class="inline-block bg-black text-white px-6 py-3 text-lg"
          >
            {props.text.retry}
          </a>
        </div>
      </Show>

      <Show when={loading() && !error()}>
        <p class="text-lg text-gray-600">{props.text.loading}</p>
      </Show>

      <Show when={!error()}>
        <div ref={checkoutContainer} />
      </Show>
    </div>
  )
}
