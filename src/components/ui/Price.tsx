import type { Locale } from '@types'
import { formatPriceWithBgn } from '@utils/func'
import { createMemo } from 'solid-js'

type Props = {
  amount: number
  amountBgn?: number
  lang: Locale
  class?: string
  bgnClass?: string
}

export const Price = (props: Props) => {
  const prices = createMemo(() =>
    formatPriceWithBgn(props.amount, props.lang, props.amountBgn),
  )

  return (
    <span class={props.class}>
      {prices()[0]}
      {prices()[1] && (
        <span
          classList={{
            'text-gray-500 ml-1 text-base font-normal': true,
            [props.bgnClass ?? '']: true,
          }}
        >
          / {prices()[1]}
        </span>
      )}
    </span>
  )
}
