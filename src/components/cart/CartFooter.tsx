import { cart } from '@signals/cart'
import { getTotalPrice } from '@utils/cart'

type Props = {
  text: {
    total: string
    checkout: string
    routeFunding: string
  }
}
export const CartFooter = (props: Props) => {
  const { checkout, routeFunding, total } = props.text
  return (
    <div class="border-t border-black pt-4 xl:pt-7">
      <div class="flex justify-between items-center mb-4 xl:mb-7">
        <span class="text-2xl font-semibold text-stone-900">{total}</span>
        <span
          class="
            flex items-center gap-1
            text-2xl md:text-3xl
            font-bold text-stone-900"
        >
          &euro;{getTotalPrice(cart()).toFixed(2)} EUR
        </span>
      </div>
      <button
        class="
        w-full
        bg-black text-center
        p-3 mb-3
        text-white text-lg md:text-xl"
      >
        {checkout}
      </button>
      <p class="text-base text-center">{routeFunding}</p>
    </div>
  )
}
