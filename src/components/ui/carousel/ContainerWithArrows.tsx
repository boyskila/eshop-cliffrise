import { type JSX, type Accessor } from 'solid-js'
import { type EmblaCarouselType } from 'embla-carousel'

type Props = {
  api: Accessor<EmblaCarouselType | undefined>
  children: JSX.Element
}

export default ({ api, children }: Props) => {
  return (
    <div class="flex items-center justify-center gap-2 lg:gap-7">
      <button
        onClick={() => api()?.scrollPrev()}
        class="cursor-pointer hidden lg:block"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-10 lg:size-12"
          viewBox="0 0 23 43"
          fill="none"
        >
          <path
            d="M21.5 1.5L1.5 21.5L21.5 41.5"
            stroke="#D9D8D8"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      {children}
      <button
        onClick={() => api()?.scrollNext()}
        class="cursor-pointer hidden lg:block"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-10 lg:size-12"
          viewBox="0 0 23 43"
          fill="none"
        >
          <path
            d="M1.5 41.5L21.5 21.5L1.5 1.5"
            stroke="#D9D8D8"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
