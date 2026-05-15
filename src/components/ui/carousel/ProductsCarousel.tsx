import { For } from 'solid-js'
import useEmblaCarousel from 'embla-carousel-solid'
import type { Locale, RenderedProductCard } from '@types'
import { CarouselDots } from './CarouselDots'
import { CAROUSEL_OPTIONS, CAROUSEL_PLUGINS } from './config'
import { formatPrice } from '@utils/func'

export default (props: {
  products: RenderedProductCard[]
  buttonText: string
  lang: Locale
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    CAROUSEL_OPTIONS,
    CAROUSEL_PLUGINS,
  )

  return (
    <div class="overflow-hidden" ref={emblaRef}>
      <div class="flex touch-pan-y touch-pinch-zoom gap-3">
        <For each={props.products}>
          {(product) => {
            const { image, hoverImage, name, price, href } = product
            return (
              <div
                classList={{
                  'flex-[0_0_70%] last:mr-3': true,
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
                  <a
                    class="group relative block w-full h-full p-0 hover:opacity-100 transition-none"
                    href={href}
                  >
                    <img
                      data-product-card-image
                      src={image.src}
                      srcset={image.srcSet}
                      sizes={image.sizes}
                      width={400}
                      height={400}
                      alt={name}
                      class="w-full h-auto object-cover object-center"
                      loading="lazy"
                    />
                    {hoverImage && (
                      <img
                        data-product-card-hover-image
                        src={hoverImage.src}
                        srcset={hoverImage.srcSet}
                        sizes={hoverImage.sizes}
                        width={400}
                        height={400}
                        alt=""
                        aria-hidden="true"
                        class="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-0 delay-0 group-hover:opacity-100 group-hover:delay-350 group-focus-visible:opacity-100 group-focus-visible:delay-100"
                        loading="lazy"
                      />
                    )}
                  </a>
                  <div class="flex justify-between w-full gap-2">
                    <div class="flex flex-col gap-1 md:gap-2 lg:gap-3">
                      <a
                        href={href}
                        class="
                          p-0
                          text-base
                          md:text-lg
                          xl:text-2xl
                          hover:underline
                          underline-offset-4
                          font-semibold
                          leading-5"
                      >
                        {name}
                      </a>
                      <div class="font-extrabold text-[19px] lg:text-xl xl:text-2xl">
                        {formatPrice(price, props.lang)}
                      </div>
                    </div>{' '}
                    <a
                      href={href}
                      aria-label={`Buy ${name} now`}
                      class="
                        phone-portrait:h-7
                        phone-landscape:h-7
                        flex items-center justify-center
                        max-h-10 w-25
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
