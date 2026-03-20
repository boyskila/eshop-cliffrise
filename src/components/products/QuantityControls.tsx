import { createSignal, onMount, onCleanup } from 'solid-js'
import Minus from 'lucide-solid/icons/minus'
import Plus from 'lucide-solid/icons/plus'
import type { Product } from '@types'
import { quantity, setQuantity } from '@signals/cart'

export const QuantityControls = ({ product }: { product: Product }) => {
  onMount(() => {
    const resetQty = () => setQuantity(1)
    window.addEventListener('product-modal:closed', resetQty)
    onCleanup(() =>
      window.removeEventListener('product-modal:closed', resetQty),
    )
  })
  return (
    <div class="flex space-x-2 self-end">
      <button
        aria-label={`Decrease quantity of ${product.name} in cart`}
        class="p-1 rounded transition-colors cursor-pointer"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
      >
        <Minus class="h-4 w-4" />
      </button>
      <span class="border border-gray size-7 flex items-center justify-center text-sm font-medium">
        {quantity()}
      </span>
      <button
        aria-label={`Increase quantity of ${product.name} in cart`}
        class="p-1 rounded transition-colors cursor-pointer"
        onClick={() => setQuantity((q) => q + 1)}
      >
        <Plus class="h-4 w-4" />
      </button>
    </div>
  )
}
