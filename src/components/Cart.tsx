import { For, Show, createEffect } from 'solid-js'
import { actions } from 'astro:actions'
import ShoppingBag from 'lucide-solid/icons/shopping-bag'
import Plus from 'lucide-solid/icons/plus'
import Minus from 'lucide-solid/icons/minus'
import Euro from 'lucide-solid/icons/euro'
import { cart, isCartOpen, toggleCart, updateCart } from '@signals/cart'
import type { Translations } from '@types'
import type { CartItem } from '@actions'
import { getTotalPrice } from '@utils/cart'

export const Cart = (props: {
  translations: Translations['cart']
  initialCart?: CartItem[]
}) => {
  createEffect(() => {
    props.initialCart && updateCart(props.initialCart)
  })
  return (
    <Show when={isCartOpen()}>
      <div class="fixed inset-0 bg-black/50 z-50" onClick={toggleCart} />
      <div class="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-stone-800 z-50 shadow-xl transition-colors">
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
            <h2 class="text-lg font-semibold text-stone-900 dark:text-white flex items-center">
              <ShoppingBag class="h-5 w-5 mr-2" />
              {props.translations.title}
            </h2>
          </div>

          <div class="flex-1 overflow-y-auto p-4">
            <Show
              when={cart().length}
              fallback={
                <div class="text-center py-12">
                  <ShoppingBag class="h-12 w-12 text-stone-400 dark:text-stone-500 mx-auto mb-4" />
                  <p class="text-stone-600 dark:text-stone-300">
                    {props.translations.empty}
                  </p>
                  <p class="text-sm text-stone-500 dark:text-stone-400 mt-2">
                    {props.translations.emptyDesc}
                  </p>
                </div>
              }
            >
              <div class="space-y-4">
                <For each={cart()}>
                  {(item) => (
                    <div class="bg-stone-50 dark:bg-stone-700 rounded-lg p-4">
                      <div class="flex items-start space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          class="w-16 h-16 object-cover rounded-lg"
                        />
                        <div class="flex-1">
                          <h3 class="font-medium text-stone-900 dark:text-white">
                            {item.name}
                          </h3>
                          <p class="text-sm text-stone-600 dark:text-stone-300">
                            ${item.price}
                          </p>

                          <div class="flex items-center justify-between mt-3">
                            <div class="flex items-center space-x-2">
                              <button
                                onClick={async () => {
                                  const { data } = await actions.updateQuantity(
                                    {
                                      productId: item.id,
                                      quantity: item.quantity - 1,
                                    }
                                  )
                                  data && updateCart(data)
                                }}
                                class="p-1 hover:bg-stone-200 dark:hover:bg-stone-600 rounded transition-colors"
                              >
                                <Minus class="h-4 w-4" />
                              </button>
                              <span class="w-8 text-center text-sm font-medium text-stone-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={async () => {
                                  const { data } = await actions.updateQuantity(
                                    {
                                      productId: item.id,
                                      quantity: item.quantity + 1,
                                    }
                                  )
                                  data && updateCart(data)
                                }}
                                class="p-1 hover:bg-stone-200 dark:hover:bg-stone-600 rounded transition-colors"
                              >
                                <Plus class="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              onClick={async () => {
                                const { data } = await actions.removeFromCart({
                                  productId: item.id,
                                })
                                data && updateCart(data)
                              }}
                              class="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                            >
                              {props.translations.remove}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>

          <Show when={cart().length > 0}>
            <div class="border-t border-stone-200 dark:border-stone-700 p-4">
              <div class="flex justify-between items-center mb-4">
                <span class="text-lg font-semibold text-stone-900 dark:text-white">
                  {props.translations.total}
                </span>
                <span class="flex items-center gap-1 text-xl font-bold text-stone-900 dark:text-white">
                  {getTotalPrice(cart()).toFixed(2)}
                  <Euro size={20} />
                </span>
              </div>

              <button class="block w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors text-center">
                {props.translations.checkout}
              </button>

              <p class="text-xs text-center text-stone-500 dark:text-stone-400 mt-2">
                {props.translations.routeFunding}
              </p>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  )
}
