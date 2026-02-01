import { For } from 'solid-js'
import type { Translations } from '@types'
import { cartNotifications } from '@signals/cart'

export const CartNotifications = (props: Translations['notification']) => {
  return (
    <div class="fixed top-25 right-1 z-50 space-y-2">
      <For each={cartNotifications()}>
        {(notification) => {
          return (
            <div class="flex animate-slide-in-right bg-white shadow-2xl max-w-sm">
              <div class="flex">
                <div class="bg-black text-white p-2 items-center flex">
                  <span class="flex rotate-180 [writing-mode:vertical-rl]">
                    {props.addedToCart}
                  </span>
                </div>

                <div class="p-4">
                  <div class="flex mb-5">
                    <img
                      src={notification.image}
                      alt={notification.name}
                      class="size-20 object-cover"
                    />
                    <div class="ml-3 flex flex-col justify-center">
                      <h4 class="font-bold text-lg">{notification.name}</h4>
                      <div class="flex items-center gap-2 font-bold text-[19px]">
                        {notification.price.toFixed(2)} &euro;
                      </div>
                    </div>
                  </div>
                  <p class="text-xs pt-2 border-t border-black">
                    {props.routeFunding}
                  </p>
                </div>
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}
