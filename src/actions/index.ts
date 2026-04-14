import { cart, type CartItem } from './cart'
import { checkout } from './checkout'
import { contact } from './contactForm'
import { searchOffices } from './searchOffices'
export type { CartItem }

export const server = {
  ...cart,
  ...checkout,
  contact,
  searchOffices,
}
