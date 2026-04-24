import { For } from 'solid-js'
import { cartNotifications } from '@signals/cart'
import { isString } from '@utils/func'

type Props = {
  text: {
    addedToCart: string
    routeFunding: string
  }
}

export const CartNotifications = ({ text }: Props) => {
  return (
    <div class="fixed top-25 right-1 z-50 space-y-2">
      <For each={cartNotifications()}>
        {(notification) => (
            <div class="flex animate-slide-in-right bg-white shadow-2xl max-w-sm">
              <div class="flex">
                <div class="bg-black text-white p-2 items-center flex">
                  <span class="flex rotate-180 [writing-mode:vertical-rl]">
                    {text.addedToCart}
                  </span>
                </div>

                <div class="p-4">
                  <div class="flex mb-5">
                    <img
                      src={
                        isString(notification.image)
                          ? notification.image
                          : notification.image.src
                      }
                      alt={notification.name}
                      width="80"
                      height="80"
                      loading="lazy"
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
                    {text.routeFunding}
                  </p>
                </div>
              </div>
            </div>
          )
        }
      </For>
    </div>
  )
}
