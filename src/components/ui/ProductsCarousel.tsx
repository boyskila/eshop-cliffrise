import { For } from 'solid-js'
import useEmblaCarousel from 'embla-carousel-solid'
import type { Product } from '@types'
import AddToCartButton from '../products/AddToCartButton'
import { CarouselDots } from './CarouselDots'
import { CAROUSEL_OPTIONS, CAROUSEL_PLUGINS } from './carousel/config'

export default (props: {
  products: Product[]
  lang: string
  buttonText: string
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    CAROUSEL_OPTIONS,
    CAROUSEL_PLUGINS,
  )

  return (
    <div class="overflow-hidden" ref={emblaRef}>
      <div class="flex touch-pan-y touch-pinch-zoom">
        <For each={props.products}>
          {({ image, name, id, price }) => (
            <div
              classList={{
                'flex-[0_0_70%] px-3': true,
                'landscape:flex-[0_0_33.33%] landscape:px-2': true,
                'md:flex-[0_0_40%] md:landscape:flex-[0_0_40%]': true,
                'xl:flex-[0_0_35%] xl:landscape:flex-[0_0_35%]': true,
                '2xl:flex-[0_0_25%] 2xl:landscape:flex-[0_0_25%]': true,
              }}
            >
              <div
                classList={{
                  'flex flex-col gap-3 justify-center items-center': true,
                  'md:gap-4 md:landscape:gap-3': true,
                  'xl:gap-5 xl:landscape:gap-5': true,
                }}
              >
                <img
                  src={image}
                  class="w-full h-auto object-cover object-center"
                  loading="lazy"
                />
                <div class="flex justify-between w-full items-center">
                  <span class="text-base md:text-lg xl:text-xl">{name}</span>
                  <div class="flex items-center gap-2 font-bold text-[19px] lg:text-xl xl:text-2xl">
                    {price.toFixed(2)} &euro;
                  </div>
                </div>
                <AddToCartButton
                  buttonText={props.buttonText}
                  productName={name}
                  productId={id}
                  lang={props.lang}
                />
              </div>
            </div>
          )}
        </For>
      </div>
      <CarouselDots api={emblaApi} />
    </div>
  )
}
