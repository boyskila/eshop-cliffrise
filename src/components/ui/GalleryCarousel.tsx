import { onCleanup, createSignal, For, createMemo, onMount } from 'solid-js'
import useEmblaCarousel from 'embla-carousel-solid'
import { images } from '../../data/carousel-images'

import { CarouselDots } from './CarouselDots'
import { CAROUSEL_OPTIONS, CAROUSEL_PLUGINS } from './carousel/config'

const imagesPerSlideMap = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
}

export default () => {
  const [screenSize, setScreenSize] = createSignal<
    'mobile' | 'tablet' | 'desktop'
  >('desktop')

  const [emblaRef, emblaApi] = useEmblaCarousel(
    CAROUSEL_OPTIONS,
    CAROUSEL_PLUGINS,
  )

  const groupedSlides = createMemo(() => {
    const imagesPerSlide = imagesPerSlideMap[screenSize()]
    const slides = []

    for (let i = 0; i < images.length; i += imagesPerSlide) {
      slides.push({
        images: images.slice(i, i + imagesPerSlide),
      })
    }

    return slides
  })

  onMount(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }
    handleResize()

    window.addEventListener('resize', handleResize)
    onCleanup(() => window.removeEventListener('resize', handleResize))
  })

  return (
    <div ref={emblaRef} class="overflow-x-hidden xl:max-w-[68%] m-auto">
      <div class="flex touch-pan-y touch-pinch-zoom">
        <For each={groupedSlides()}>
          {(slide) => (
            <div
              classList={{
                'flex-[0_0_100%] px-3': true,
                'h-[50vh] sm:h-[65vh] md:h-[70vh] lg:h-[80vh]': true,
              }}
            >
              {slide.images.length === 3 ? (
                <div class="flex flex-col md:flex-row gap-4 h-full">
                  <div class="flex flex-col md:flex-row flex-1 gap-4 h-full">
                    <div class="flex-1 overflow-hidden">
                      <img
                        src={slide.images[0]}
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div class="flex flex-col gap-4 w-full md:w-1/2 h-full">
                      <div class="flex-1 overflow-hidden">
                        <img
                          src={slide.images[1]}
                          class="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div class="flex-1 overflow-hidden">
                        <img
                          src={slide.images[2]}
                          class="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  classList={{
                    'flex-col': slide.images.length === 1,
                    'flex-col sm:flex-row': slide.images.length === 2,
                    'flex gap-4 h-full': true,
                  }}
                >
                  <For each={slide.images}>
                    {(image) => (
                      <div class="flex-1 overflow-hidden flex items-center justify-center h-full">
                        <img
                          src={image}
                          class="w-full h-full object-cover object-center"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </For>
                </div>
              )}
            </div>
          )}
        </For>
      </div>
      <CarouselDots api={emblaApi} />
    </div>
  )
}
