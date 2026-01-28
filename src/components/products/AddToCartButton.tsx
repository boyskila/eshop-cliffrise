import { actions } from 'astro:actions'
import { addCartNotification, updateCart } from '@signals/cart'

export default function AddToCartButton(props: {
  productName: string
  buttonText: string
  productId: string
  lang: string
}) {
  const productName = props.productName
  const buttonText = props.buttonText
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
      class="bg-black text-white px-4 py-2 font-medium w-[150px]"
    >
      {buttonText}
    </button>
  )
}
