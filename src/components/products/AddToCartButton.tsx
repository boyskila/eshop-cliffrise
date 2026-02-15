import { actions } from 'astro:actions'
import { addCartNotification, updateCart } from '@signals/cart'

export default function AddToCartButton(props: {
  productName: string
  productId: string
  lang: string
}) {
  const productName = props.productName
  const productId = props.productId

  return (
    <button
      onClick={async () => {
        const { data } = await actions.addToCart({
          productId,
          lang: props.lang,
        })
        const { cart, addedItem } = data ?? {}
        if (cart) {
          updateCart(cart)
          addedItem && addCartNotification(addedItem)
        }
      }}
      aria-label={`Add ${productName} to cart`}
      class="bg-black text-white size-[35px] md:size-[43px] mt-1 flex items-center justify-center"
    >
      <svg viewBox="0 0 24 24" class="size-[70%]">
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  )
}
