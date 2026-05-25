import { cart } from '@signals/cart'
import { getTotalPrice, getTotalPriceBgn } from '@utils/cart'
import { CheckoutButton } from '@components/checkout/CheckoutButton'
import type { Locale } from '@types'
import { Price } from '@components/ui/Price'

type Props = {
  lang: Locale
  text: {
    total: string
    checkout: string
    routeFunding: string
  }
}
export const CartFooter = (props: Props) => {
  return (
    <div class="border-t border-black pt-4 xl:pt-7">
      <div class="flex justify-between items-center mb-4 xl:mb-7">
        <span class="text-2xl font-semibold text-stone-900">
          {props.text.total}
        </span>
        <Price
          amount={getTotalPrice(cart())}
          amountBgn={getTotalPriceBgn(cart())}
          lang={props.lang}
          class="text-2xl md:text-3xl font-bold text-stone-900"
          bgnClass="text-xl md:text-2xl"
        />
      </div>
      <CheckoutButton lang={props.lang} text={props.text.checkout} />
      <p class="text-base text-center">{props.text.routeFunding}</p>
    </div>
  )
}
