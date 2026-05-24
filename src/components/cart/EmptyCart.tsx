import ShoppingBag from 'lucide-solid/icons/shopping-bag'
import { setIsCartOpen } from '@signals/cart'

type Props = {
  empty: string
  emptyDescBeforeProducts: string
  emptyDescProductsLink: string
  emptyDescAfterProducts: string
  productsHref: string
}

export const EmptyCart = (props: Props) => {
  return (
    <div class="text-center">
      <ShoppingBag class="h-12 w-12 mx-auto mb-4" />
      <p class="text-stone-600">{props.empty}</p>
      <p class="text-sm text-stone-500 mt-2">
        {props.emptyDescBeforeProducts}
        <a
          href={props.productsHref}
          onClick={() => setIsCartOpen(false)}
          class="font-semibold underline underline-offset-4"
        >
          {props.emptyDescProductsLink}
        </a>
        {props.emptyDescAfterProducts}
      </p>
    </div>
  )
}
