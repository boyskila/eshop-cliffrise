import type { Product } from '@types'
import { createSignal } from 'solid-js'

export const [cartCount, setCartCount] = createSignal(0)
export const [cartNotifications, setCartNotifications] = createSignal<
  Product[]
>([])

export const addCartNotification = (product: Product) => {
  const productId = product.id
  const isProductAlreadyAdded = cartNotifications().find(
    (notification) => notification.id === productId
  )
  if (!isProductAlreadyAdded) {
    setCartNotifications((notifications) => [...notifications, product])
    setTimeout(() => {
      setCartNotifications((notifications) => {
        return notifications.filter(
          (notification) => notification.id !== productId
        )
      })
    }, 3000)
  }
}
