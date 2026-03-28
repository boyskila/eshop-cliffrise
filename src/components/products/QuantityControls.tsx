import Minus from 'lucide-solid/icons/minus'
import Plus from 'lucide-solid/icons/plus'
import { quantity, setQuantity } from '@signals/cart'

type Props = {
  productName: string
}

export const QuantityControls = ({ productName }: Props) => {
  return (
    <div
      role="group"
      aria-label={`Quantity for ${productName}`}
      class="flex space-x-2 self-end"
    >
      <button
        aria-label={`Decrease quantity of ${productName}`}
        class="p-1 rounded transition-colors cursor-pointer"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
      >
        <Minus class="h-4 w-4" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        aria-label={`Current quantity of ${productName}`}
        class="border border-gray size-6 flex items-center justify-center text-sm font-medium"
      >
        {quantity()}
      </output>
      <button
        aria-label={`Increase quantity of ${productName}`}
        class="p-1 rounded transition-colors cursor-pointer"
        onClick={() => setQuantity((q) => q + 1)}
      >
        <Plus class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
