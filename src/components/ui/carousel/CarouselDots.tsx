import {
  For,
  createSignal,
  createEffect,
  type Accessor,
  onMount,
} from 'solid-js'
import { type EmblaCarouselType } from 'embla-carousel'

export const CarouselDots = (props: {
  api: Accessor<EmblaCarouselType | undefined>
  class?: string
}) => {
  const [scrollSnaps, setScrollSnaps] = createSignal<number[]>([])
  const [selectedIndex, setSelectedIndex] = createSignal(0)

  const onSelect = (api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap())
  }

  const onInit = (api: EmblaCarouselType) => {
    setScrollSnaps(api.scrollSnapList())
  }

  onMount(() => {
    const api = props.api()
    if (api) {
      setSelectedIndex(api.selectedScrollSnap())
    }
  })

  createEffect(() => {
    const api = props.api()
    if (api) {
      onInit(api)
      onSelect(api)
      api.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect)
    }
  })

  return (
    <div class={`flex justify-center gap-2 mt-7 ${props.class || ''}`}>
      <For each={scrollSnaps()}>
        {(_, index) => {
          return (
            <button
              classList={{
                'cursor-pointer': true,
                embla__dot: true,
                'w-7 h-2 transition-colors': true,
                'bg-black': index() === selectedIndex(),
                'bg-gray-400': index() !== selectedIndex(),
              }}
              aria-label={`Go to slide ${index() + 1}`}
              onClick={() => props.api()?.scrollTo(index())}
            />
          )
        }}
      </For>
    </div>
  )
}
