import { cart, type CartItem } from './cart'
import { checkout } from './checkout'
import { contact } from './contactForm'
export type { CartItem }

export const server = {
  ...cart,
  ...checkout,
  contact,
}
