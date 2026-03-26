import { createSignal, onMount, onCleanup } from 'solid-js'
import { quantity, setQuantity } from '@signals/cart'

export default function BuyNowButton(props: {
  productName: string
  productId: string
  lang: string
  label?: string
  disabled?: boolean
}) {
  const productName = props.productName
  const [isDisabled, setIsDisabled] = createSignal(props.disabled ?? false)
  const [kind, setKind] = createSignal<string | undefined>(undefined)

  onMount(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      const selectedKind = detail?.kind as string | null
      setKind(selectedKind ?? undefined)
      setIsDisabled(!selectedKind)
    }
    window.addEventListener('kind-changed', handler)
    onCleanup(() => window.removeEventListener('kind-changed', handler))
  })

  return (
    <button
      onClick={() => {
        const currentKind = kind()
        const currentQuantity = quantity()

        window.alert(
          `Buy Now: ${productName}${currentKind ? ` (${currentKind})` : ''} x${currentQuantity}`,
        )

        setQuantity(1)
      }}
      data-buy-now-button
      disabled={isDisabled()}
      aria-label={`Buy ${productName} now`}
      class="px-4 py-0
        flex items-center justify-center
        bg-black text-white text-base md:text-lg
        leading-none tracking-[2px] uppercase
        disabled:opacity-40
        disabled:cursor-not-allowed"
    >
      {props.label}
    </button>
  )
}
