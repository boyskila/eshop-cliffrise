import { For } from 'solid-js'
import useEmblaCarousel from 'embla-carousel-solid'
import { CAROUSEL_OPTIONS } from './config'
import Arrows from './ContainerWithArrows'
import type { GetImageResult } from 'astro'

export default (props: {
  reviews: { text: string; author: string; image: GetImageResult }[]
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(CAROUSEL_OPTIONS)

  return (
    <Arrows api={emblaApi!}>
      <div class="overflow-hidden" ref={emblaRef}>
        <div class="flex touch-pan-y touch-pinch-zoom h-[300px] lg:h-[270px] items-center">
          <For each={props.reviews}>
            {({ text, author, image }) => (
              <div
                class="landscape:flex-[0_0_45%] landscape:lg:flex-[0_0_40%] landscape:2xl:flex-[0_0_24.5%] me-3
                flex-[0_0_90%] md:flex-[0_0_40%] xl:flex-[0_0_33.33%] h-full"
              >
                <div class="p-4 px-7 bg-[#f7f7f7] mt-[40px] h-full">
                  <img
                    src={image.src}
                    alt={author}
                    class="size-20 -mt-13 ml-2"
                    loading="lazy"
                  />
                  <p class="ml-25 -mt-7 text-xl font-bold">{author}</p>
                  <p class="mt-5 leading-5">{text}</p>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </Arrows>
  )
}
