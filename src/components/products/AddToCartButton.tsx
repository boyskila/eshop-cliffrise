import { actions } from 'astro:actions'
import { createSignal, onMount, onCleanup } from 'solid-js'
import {
  addCartNotification,
  quantity,
  setQuantity,
  updateCart,
} from '@signals/cart'
import type { Locale } from '@types'

export const AddToCartButton = (props: {
  productName: string
  productId: string
  lang: Locale
  label?: string
  disabled?: boolean
}) => {
  const productName = props.productName
  const productId = props.productId
  const [isDisabled, setIsDisabled] = createSignal(props.disabled ?? false)
  const [kind, setKind] = createSignal<string | undefined>(undefined)

  onMount(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      const selectedKind = detail?.kind as string
      setKind(selectedKind)
      setIsDisabled(!selectedKind)
    }
    window.addEventListener('kind-changed', handler)
    onCleanup(() => window.removeEventListener('kind-changed', handler))
  })

  return (
    <button
      onClick={async () => {
        const { data } = await actions.addToCart({
          productId,
          lang: props.lang,
          kind: kind(),
          quantity: quantity(),
        })
        const { cart, addedItem } = data ?? {}
        if (cart) {
          updateCart(cart)
          addedItem && addCartNotification(addedItem)
          setQuantity(1)
        }
      }}
      data-add-to-cart-button
      disabled={isDisabled()}
      aria-label={`Add ${productName} to cart`}
      class="p-2 md:p-3
        flex items-center justify-center flex-1
        border border-black bg-white text-black
        text-base md:text-lg leading-none
        tracking-[2px] uppercase
        disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {props.label}
    </button>
  )
}
