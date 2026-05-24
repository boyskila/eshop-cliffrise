import { For } from 'solid-js'
import useEmblaCarousel from 'embla-carousel-solid'
import { CarouselDots } from '@components/ui/carousel/CarouselDots'
import {
  CAROUSEL_OPTIONS,
  CAROUSEL_PLUGINS,
} from '@components/ui/carousel/config'

type Props = {
  images: string[]
  alt: string
}

export default (props: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    CAROUSEL_OPTIONS,
    CAROUSEL_PLUGINS,
  )

  return (
    <div class="overflow-hidden" ref={emblaRef}>
      <div class="flex touch-pan-y touch-pinch-zoom">
        <For each={props.images}>
          {(image, index) => (
            <div class="flex-[0_0_100%] px-2">
              <img
                src={image}
                alt={`${props.alt} ${index() + 1}`}
                class="bg-shimmer aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </For>
      </div>
      <CarouselDots api={emblaApi} class="mt-4" />
    </div>
  )
}
