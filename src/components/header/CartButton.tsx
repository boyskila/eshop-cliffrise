import { createEffect } from 'solid-js'
import ShoppingCart from 'lucide-solid/icons/shopping-cart'
import { cartCount, setCartCount } from '@signals/cart'

type Props = { title: string; initialCartCount: number }

export default function CartButton(props: Props) {
  createEffect(() => {
    setCartCount(props.initialCartCount)
  })

  return (
    <button
      aria-label={`Shopping cart with ${cartCount()} ${
        cartCount() === 1 ? 'item' : 'items'
      }`}
      class="relative bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
    >
      <ShoppingCart class="h-4 w-4" />
      <span>{props.title}</span>
      <span
        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
        cart-counter
      >
        {cartCount()}
      </span>
    </button>
  )
}
