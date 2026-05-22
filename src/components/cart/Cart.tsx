import { actions } from 'astro:actions'
import { For, Show, createEffect, onCleanup, onMount } from 'solid-js'
import { cart, isCartOpen, toggleCart, updateCart } from '@signals/cart'
import type { CartItem } from '@actions'
import { DecreaseQuantityButton } from './DecreaseQuantityButton'
import { IncreaseQuantityButton } from './IncreaseQuantityButton'
import { RemoveFromCartButton } from './RemoveFromCartButton'
import { EmptyCart } from './EmptyCart'
import { CartFooter } from './CartFooter'
import { CartHeader } from './CartHeader'
import type { Locale } from '@types'
import { formatPrice } from '@utils/func'

type Props = {
  lang: Locale
  text: {
    title: string
    empty: string
    emptyDesc: string
    total: string
    checkout: string
    routeFunding: string
  }
  initialCart?: CartItem[]
}

export const Cart = (props: Props) => {
  const syncCartFromSession = async () => {
    const { data } = await actions.getCart()
    data && updateCart(data)
  }

  createEffect(() => {
    updateCart(props.initialCart ?? [])
  })

  onMount(() => {
    const handleCartSync = () => {
      void syncCartFromSession()
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleCartSync()
      }
    }

    void syncCartFromSession()
    window.addEventListener('pageshow', handleCartSync)
    window.addEventListener('popstate', handleCartSync)
    window.addEventListener('focus', handleCartSync)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('astro:page-load', handleCartSync)

    onCleanup(() => {
      window.removeEventListener('pageshow', handleCartSync)
      window.removeEventListener('popstate', handleCartSync)
      window.removeEventListener('focus', handleCartSync)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('astro:page-load', handleCartSync)
    })
  })

  return (
    <Show when={isCartOpen()}>
      <div
        class="fixed inset-0 bg-black/50 z-[60]"
        onClick={toggleCart}
        aria-label="Close shopping cart"
      />
      <div
        data-cart-dialog
        role="dialog"
        aria-label="Shopping cart"
        class="fixed right-0 top-0 h-full w-full md:max-w-md bg-white z-[70] p-7 xl:p-8"
      >
        <div class="flex flex-col h-[97%]">
          <CartHeader title={props.text.title} />
          <div class="mb-5 mt-3 xl:mb-5 xl:mt-5 h-[1px] bg-black" />

          <div class="flex-1 overflow-y-auto">
            <Show
              when={cart().length}
              fallback={
                <EmptyCart
                  empty={props.text.empty}
                  emptyDesc={props.text.emptyDesc}
                />
              }
            >
              <For each={cart()}>
                {(item) => (
                  <div class="flex items-center space-x-3 relative ml-3 first:mt-4 not-first:my-6">
                    <RemoveFromCartButton
                      item={item}
                      class="absolute -left-2 -top-2"
                    />
                    <img src={item.image} alt={item.name} class="size-20" />
                    <div class="flex flex-col flex-1">
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = item.href
                        }}
                        class="text-lg font-medium mb-2 hover:underline underline-offset-4 leading-5 cursor-pointer"
                      >
                        {item.name}
                      </a>
                      <div class="flex justify-between">
                        <p class="text-lg font-bold ml-1">
                          {formatPrice(item.price, props.lang)}
                        </p>

                        <div class="flex space-x-2 self-end">
                          <DecreaseQuantityButton item={item} />
                          <span class="border border-gray size-7 flex items-center justify-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <IncreaseQuantityButton item={item} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>

          <Show when={cart().length > 0}>
            <CartFooter
              lang={props.lang}
              text={{
                total: props.text.total,
                checkout: props.text.checkout,
                routeFunding: props.text.routeFunding,
              }}
            />
          </Show>
        </div>
      </div>
    </Show>
  )
}
