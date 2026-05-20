import { actions } from 'astro:actions'
import { createSignal, onCleanup, onMount } from 'solid-js'
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
  const [isDisabled, setIsDisabled] = createSignal(props.disabled ?? false)
  const [isBusy, setIsBusy] = createSignal(false)
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

  const handleAddToCart = async () => {
    setIsBusy(true)
    try {
      const { data } = await actions.addToCart({
        productId: props.productId,
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
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      data-add-to-cart-button
      disabled={isDisabled() || isBusy()}
      aria-label={`Add ${props.productName} to cart`}
      class="p-2 md:p-3
        flex items-center justify-center flex-1
        border border-black bg-black text-white
        text-base md:text-lg leading-none
        tracking-[2px] uppercase
        disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
    >
      {props.label}
    </button>
  )
}
