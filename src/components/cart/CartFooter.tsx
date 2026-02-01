import Euro from 'lucide-solid/icons/euro'
import { cart } from '@signals/cart'
import { getTotalPrice } from '@utils/cart'

type Props = {
  translations: {
    total: string
    checkout: string
    routeFunding: string
  }
}
export const CartFooter = (props: Props) => {
  const { checkout, routeFunding, total } = props.translations
  return (
    <div class="border-t border-black pt-4 xl:pt-7">
      <div class="flex justify-between items-center mb-4 xl:mb-7">
        <span class="text-lg font-semibold text-stone-900 dark:text-white">
          {total}
        </span>
        <span class="flex items-center gap-1 text-xl font-bold text-stone-900 dark:text-white">
          {getTotalPrice(cart()).toFixed(2)}
          <Euro size={20} />
        </span>
      </div>

      <button class="w-full text-white p-3 bg-black text-center mb-3">
        {checkout}
      </button>

      <p class="text-base text-center">{routeFunding}</p>
    </div>
  )
}
