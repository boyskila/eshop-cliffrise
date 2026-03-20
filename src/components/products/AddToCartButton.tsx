import { actions } from 'astro:actions'
import {
  addCartNotification,
  quantity,
  setQuantity,
  updateCart,
} from '@signals/cart'

export default function AddToCartButton(props: {
  productName: string
  productId: string
  lang: string
  label?: string
  disabled?: boolean
}) {
  const productName = props.productName
  const productId = props.productId

  return (
    <button
      onClick={async (event) => {
        const kind = (event.currentTarget as HTMLButtonElement).dataset
          .productKind
        const { data } = await actions.addToCart({
          productId,
          lang: props.lang,
          kind,
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
      disabled={props.disabled}
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
