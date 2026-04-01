import { cart, toggleCart } from '@signals/cart'

type Props = {
  lang: string
  text: string
}

export const CheckoutButton = (props: Props) => {
  const handleCheckout = () => {
    toggleCart()
    window.location.href = `/${props.lang}/checkout/shipping/`
  }

  return (
    <button
      class="w-full bg-black text-center p-3 mb-3 text-white text-lg md:text-xl disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleCheckout}
      disabled={cart().length === 0}
    >
      {props.text}
    </button>
  )
}
