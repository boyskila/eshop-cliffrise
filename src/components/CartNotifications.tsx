import { For } from 'solid-js'
import CheckCircle from 'lucide-solid/icons/check-circle'
import ShoppingBag from 'lucide-solid/icons/shopping-bag'
import type { Translations } from '@types'
import { cartNotifications } from '@signals/cart'

export const CartNotifications = (props: Translations['notification']) => {
  return (
    <div class="fixed top-20 right-4 z-50 space-y-2">
      <For each={cartNotifications()}>
        {(notification) => {
          return (
            <div class="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle class="h-5 w-5 text-green-600" />
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <ShoppingBag class="h-4 w-4 text-green-600" />
                    <p class="text-sm font-semibold text-green-800">
                      {props.addedToCart}
                    </p>
                  </div>

                  <div class="flex items-center space-x-3">
                    <img
                      class="w-10 h-10 object-cover rounded"
                      src={notification.image}
                      alt={notification.name}
                    />
                    <div class="flex-1">
                      <p class="text-sm font-medium text-stone-900 truncate">
                        {notification.name}
                      </p>
                      <p class="text-xs text-stone-600">{notification.price}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-3 bg-green-50 rounded-md p-2">
                <p class="text-xs text-green-700">🎯 {props.routeFunding}</p>
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}
