import { For } from 'solid-js'
import useEmblaCarousel from 'embla-carousel-solid'
import type { Product } from '@types'
import { CarouselDots } from './CarouselDots'
import { CAROUSEL_OPTIONS, CAROUSEL_PLUGINS } from './config'
import { isString } from '@utils/func'

export default (props: {
  products: Product[]
  buttonText: string
  lang: string
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    CAROUSEL_OPTIONS,
    CAROUSEL_PLUGINS,
  )

  return (
    <div class="overflow-hidden" ref={emblaRef}>
      <div class="flex touch-pan-y touch-pinch-zoom">
        <For each={props.products}>
          {(product) => {
            const { image, name, price, href } = product
            return (
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
                  <a class="w-full h-full" href={href}>
                    <img
                      src={isString(image) ? image : image.src}
                      width={400}
                      height={400}
                      alt={name}
                      class="w-full h-auto object-cover object-center"
                      loading="lazy"
                    />
                  </a>
                  <div class="flex justify-between w-full gap-2">
                    <div class="flex flex-col gap-1 pl-1">
                      <a
                        href={href}
                        class="
                          p-0
                          text-base
                          md:text-lg
                          xl:text-2xl
                          underline-offset-4
                          font-semibold
                          hover:underline"
                      >
                        {name}
                      </a>
                      <div class="font-bold text-[19px] lg:text-xl xl:text-2xl">
                        {price.toFixed(2)} &euro;
                      </div>
                    </div>{' '}
                    <a
                      href={href}
                      aria-label={`Buy ${name} now`}
                      class="
                        phone-portrait:h-7
                        phone-landscape:h-7
                        flex items-center justify-center
                        max-h-10 w-32
                        text-sm
                        md:text-base
                        bg-black text-white lg:text-lg
                        leading-none tracking-[2px] uppercase"
                    >
                      {props.buttonText}
                    </a>
                  </div>
                </div>
              </div>
            )
          }}
        </For>
      </div>
      <CarouselDots api={emblaApi} />
    </div>
  )
}
