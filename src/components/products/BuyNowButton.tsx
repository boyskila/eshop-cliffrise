import { quantity, setQuantity } from '@signals/cart'

export default function BuyNowButton(props: {
  productName: string
  productId: string
  lang: string
  label?: string
  disabled?: boolean
}) {
  const productName = props.productName

  return (
    <button
      onClick={(event) => {
        const kind = (event.currentTarget as HTMLButtonElement).dataset
          .productKind
        const currentQuantity = quantity()

        window.alert(
          `Buy Now: ${productName}${kind ? ` (${kind})` : ''} x${currentQuantity}`,
        )

        setQuantity(1)
      }}
      data-buy-now-button
      disabled={props.disabled}
      aria-label={`Buy ${productName} now`}
      class="p2 md:p-3
        flex items-center justify-center flex-1
        bg-black text-white text-base md:text-lg
        leading-none tracking-[2px] uppercase
        disabled:opacity-40
        disabled:cursor-not-allowed"
    >
      {props.label}
    </button>
  )
}
