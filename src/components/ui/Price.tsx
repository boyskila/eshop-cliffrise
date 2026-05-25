import type { Locale } from '@types'
import { formatPriceWithBgn } from '@utils/func'

type Props = {
  amount: number
  amountBgn?: number
  lang: Locale
  class?: string
  bgnClass?: string
}

export const Price = (props: Props) => {
  const [eurPrice, bgnPrice] = formatPriceWithBgn(
    props.amount,
    props.lang,
    props.amountBgn,
  )
  return (
    <span class={props.class}>
      {eurPrice}
      {bgnPrice && (
        <span
          classList={{
            'text-gray-500 ml-1 text-base font-normal': true,
            [props.bgnClass ?? '']: true,
          }}
        >
          / {bgnPrice}
        </span>
      )}
    </span>
  )
}
