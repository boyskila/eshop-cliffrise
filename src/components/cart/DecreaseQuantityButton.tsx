import { actions } from 'astro:actions'
import { Minus } from 'lucide-solid'
import { updateCart } from '@signals/cart'
import type { CartItem } from '@actions'

type Props = {
  item: CartItem
}

export const DecreaseQuantityButton = ({ item }: Props) => {
  return (
    <button
      aria-label={`Decrease quantity of ${item.name} in cart`}
      onClick={async () => {
        const { data } = await actions.updateQuantity({
          productId: item.id,
          quantity: item.quantity - 1,
        })
        data && updateCart(data)
      }}
      class="p-1 rounded transition-colors cursor-pointer"
    >
      <Minus class="h-4 w-4" />
    </button>
  )
}
