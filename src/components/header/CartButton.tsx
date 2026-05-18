import { createEffect, createSignal, Show } from 'solid-js'
import { cartCount, isCartOpen, toggleCart } from '@signals/cart'

type Props = { initialCartCount: number }

export default function CartButton(props: Props) {
  const [count, setCount] = createSignal(props.initialCartCount)
  createEffect(() => {
    setCount(cartCount())
  })
  return (
    <button
      onClick={toggleCart}
      aria-expanded={isCartOpen()}
      aria-label={`Shopping cart with ${count()} ${
        count() === 1 ? 'item' : 'items'
      }`}
      class="relative cursor-pointer p-1 hover:opacity-80 transition-opacity pt-2"
    >
      <svg
        width="31"
        height="31"
        viewBox="0 0 31 31"
        class="size-[25px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.4735 30.629C12.8817 30.629 14.0232 29.4366 14.0232 27.9656C14.0232 26.4947 12.8817 25.3022 11.4735 25.3022C10.0654 25.3022 8.92383 26.4947 8.92383 27.9656C8.92383 29.4366 10.0654 30.629 11.4735 30.629Z"
          fill="white"
        />
        <path
          d="M25.4969 30.629C26.9051 30.629 28.0466 29.4366 28.0466 27.9656C28.0466 26.4947 26.9051 25.3022 25.4969 25.3022C24.0888 25.3022 22.9473 26.4947 22.9473 27.9656C22.9473 29.4366 24.0888 30.629 25.4969 30.629Z"
          fill="white"
        />
        <path
          d="M12.2767 22.6389C11.4226 22.6389 10.5812 22.3326 9.89277 21.7599C9.19161 21.174 8.70717 20.335 8.54144 19.4295L6.41246 8.32311C6.41246 8.32311 6.39971 8.24321 6.38696 8.20326L5.32884 2.67671H1.27484C0.573679 2.67671 0 2.07745 0 1.34501C0 0.612581 0.573679 0 1.27484 0H6.37421C6.98613 0 7.50882 0.452777 7.62355 1.06536L8.69442 6.65849H29.3214C29.7038 6.65849 30.0608 6.83161 30.303 7.1379C30.5452 7.44419 30.6472 7.8437 30.5707 8.24321L28.531 19.4162C28.3525 20.3483 27.868 21.174 27.1796 21.7599C26.4785 22.3459 25.5988 22.6522 24.7064 22.6389H12.3405C12.3405 22.6389 12.2895 22.6389 12.2767 22.6389ZM9.20436 9.32189L11.0401 18.8968C11.1039 19.2031 11.2569 19.4827 11.4863 19.6825C11.7158 19.8822 12.009 19.9622 12.315 19.9755H24.7319C25.0634 19.9755 25.3439 19.8822 25.5861 19.6825C25.8155 19.4827 25.9813 19.2031 26.0323 18.9101L27.7788 9.3352H9.20436V9.32189Z"
          fill="white"
        />
      </svg>
      <Show
        when={count()}
        fallback={
          <span class="absolute -top-2 -right-2 h-5 w-5 opacity-0"></span>
        }
      >
        <span class="absolute top-[-4px] -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {count()}
        </span>
      </Show>
    </button>
  )
}
