import { cart } from '@signals/cart'
import { getTotalPrice } from '@utils/cart'
import { CheckoutButton } from '@components/checkout/CheckoutButton'
import type { Locale } from '@types'
import { formatPrice } from '@utils/func'

type Props = {
  lang: Locale
  text: {
    total: string
    checkout: string
    routeFunding: string
  }
}
export const CartFooter = (props: Props) => {
  const { checkout, routeFunding, total } = props.text
  const { lang } = props
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
          {formatPrice(getTotalPrice(cart()), lang)}
        </span>
      </div>
      <CheckoutButton lang={lang} text={checkout} />
      <p class="text-base text-center">{routeFunding}</p>
    </div>
  )
}
