import type { CartItem } from '@actions'
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

export const [cart, setCart] = createSignal<CartItem[]>([])

export const updateCart = (cart: CartItem[]) => {
  const cartCount = cart.reduce((sum, products) => sum + products.quantity, 0)
  setCart(cart)
  setCartCount(cartCount)
}

export const [isCartOpen, setIsCartOpen] = createSignal(false)

export const toggleCart = () => {
  setIsCartOpen((isOpen) => !isOpen)
}
