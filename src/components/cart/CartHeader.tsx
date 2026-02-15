import Close from 'lucide-solid/icons/x'
import { toggleCart } from '@signals/cart'

type Props = {
  title: string
}

export const CartHeader = ({ title }: Props) => {
  return (
    <div class="flex justify-between items-center">
      <h2 class="text-xl lg:text-2xl font-bold text-stone-900 flex items-center">
        {title}
      </h2>
      <button
        onClick={toggleCart}
        aria-label="Close shopping cart"
        class="cursor-pointer hover:text-stone-600"
      >
        <Close class="size-6" />
      </button>
    </div>
  )
}
