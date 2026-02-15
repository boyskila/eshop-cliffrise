import ShoppingBag from 'lucide-solid/icons/shopping-bag'

type Props = {
  empty: string
  emptyDesc: string
}

export const EmptyCart = (props: Props) => {
  return (
    <div class="text-center">
      <ShoppingBag class="h-12 w-12 mx-auto mb-4" />
      <p class="text-stone-600">{props.empty}</p>
      <p class="text-sm text-stone-500 mt-2">{props.emptyDesc}</p>
    </div>
  )
}
