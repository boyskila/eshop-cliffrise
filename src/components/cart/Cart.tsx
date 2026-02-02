import { For, Show, createEffect } from 'solid-js'
import { cart, isCartOpen, toggleCart, updateCart } from '@signals/cart'
import type { Translations } from '@types'
import type { CartItem } from '@actions'
import { DecreaseQuantityButton } from './DecreaseQuantityButton'
import { IncreaseQuantityButton } from './IncreaseQuantityButton'
import { RemoveFromCartButton } from './RemoveFromCartButton'
import { EmptyCart } from './EmptyCart'
import { CartFooter } from './CartFooter'
import { CartHeader } from './CartHeader'

export const Cart = (props: {
  translations: Translations['cart']
  initialCart?: CartItem[]
}) => {
  createEffect(() => {
    props.initialCart && updateCart(props.initialCart)
  })

  createEffect(() => {
    isCartOpen()
      ? document.body.classList.add('overflow-hidden')
      : document.body.classList.remove('overflow-hidden')
  })

  return (
    <Show when={isCartOpen()}>
      <div
        class="fixed inset-0 bg-black/50 z-50"
        onClick={toggleCart}
        aria-label="Close shopping cart"
      />
      <div
        role="dialog"
        aria-label="Shopping cart"
        class="fixed right-0 top-0 h-full w-full md:max-w-md bg-white z-50 p-7 xl:p-8"
      >
        <div class="flex flex-col h-full">
          <CartHeader title={props.translations.title} />
          <div class="mb-5 mt-3 xl:mb-5 xl:mt-5 h-[1px] bg-black" />

          <div class="flex-1 overflow-y-auto">
            <Show
              when={cart().length}
              fallback={
                <EmptyCart
                  empty={props.translations.empty}
                  emptyDesc={props.translations.emptyDesc}
                />
              }
            >
              <For each={cart()}>
                {(item) => (
                  <div class="flex items-center space-x-3 relative ml-3 first:mt-4 not-first:my-6">
                    <RemoveFromCartButton
                      item={item}
                      className="absolute -left-2 -top-2"
                    />
                    <img src={item.image} alt={item.name} class="size-20" />
                    <div class="flex items-center justify-between flex-1">
                      <div>
                        <h3 class="text-lg font-medium mb-2">{item.name}</h3>
                        <p class="text-lg font-bold">${item.price}</p>
                      </div>

                      <div class="flex space-x-2 self-end">
                        <DecreaseQuantityButton item={item} />
                        <span class="border border-gray size-7 flex items-center justify-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <IncreaseQuantityButton item={item} />
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>

          <Show when={cart().length > 0}>
            <CartFooter
              translations={{
                total: props.translations.total,
                checkout: props.translations.checkout,
                routeFunding: props.translations.routeFunding,
              }}
            />
          </Show>
        </div>
      </div>
    </Show>
  )
}
