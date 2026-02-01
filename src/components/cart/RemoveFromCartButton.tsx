import { actions } from 'astro:actions'
import { updateCart } from '@signals/cart'
import type { CartItem } from '@actions'

type Props = {
  item: CartItem
  className?: string
}

export const RemoveFromCartButton = ({ item, className }: Props) => {
  return (
    <button
      aria-label={`Remove ${item.name} from cart`}
      onClick={async () => {
        const { data } = await actions.removeFromCart({
          productId: item.id,
        })
        data && updateCart(data)
      }}
      classList={{
        [className ?? '']: true,
        'text-md font-bold self-end cursor-pointer': true,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <circle cx="10" cy="10" r="10" fill="#919191" />
        <path
          d="M14 6L6 14"
          stroke="white"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M6 6L14 14"
          stroke="white"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  )
}
