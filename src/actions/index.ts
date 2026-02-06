import { cart, type CartItem } from './cart'
import { contact } from './contactForm'
export type { CartItem }

export const server = {
  ...cart,
  contact,
}
