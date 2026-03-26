import Minus from 'lucide-solid/icons/minus'
import Plus from 'lucide-solid/icons/plus'
import type { Product } from '@types'
import { quantity, setQuantity } from '@signals/cart'

export const QuantityControls = ({ product }: { product: Product }) => {
  return (
    <div
      role="group"
      aria-label={`Quantity for ${product.name}`}
      class="flex space-x-2 self-end"
    >
      <button
        aria-label={`Decrease quantity of ${product.name}`}
        class="p-1 rounded transition-colors cursor-pointer"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
      >
        <Minus class="h-4 w-4" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        aria-label={`Current quantity of ${product.name}`}
        class="border border-gray size-6 flex items-center justify-center text-sm font-medium"
      >
        {quantity()}
      </output>
      <button
        aria-label={`Increase quantity of ${product.name}`}
        class="p-1 rounded transition-colors cursor-pointer"
        onClick={() => setQuantity((q) => q + 1)}
      >
        <Plus class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
