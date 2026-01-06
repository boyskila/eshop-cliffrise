import { actions } from 'astro:actions'
import Plus from 'lucide-solid/icons/plus'
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
      class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
    >
      <Plus class="h-4 w-4" />
      <span>{buttonText}</span>
    </button>
  )
}
