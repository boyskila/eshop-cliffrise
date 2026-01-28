import 'keen-slider/keen-slider.min.css'
import {
  createUniqueId,
  createEffect,
  createSignal,
  For,
  createMemo,
  onMount,
  onCleanup,
} from 'solid-js'
import KeenSlider, { type KeenSliderInstance } from 'keen-slider'
import { images } from '../../data/carousel-images'

type SlideContent = {
  images: string[]
}

export const Carousel = () => {
  const slideId = createUniqueId()
  const [current, setCurrent] = createSignal(0)
  const [screenSize, setScreenSize] = createSignal<
    'mobile' | 'tablet' | 'desktop'
  >('desktop')
  let sliderRef: KeenSliderInstance | null = null

  const groupedSlides = createMemo(() => {
    const imagesPerSlide =
      screenSize() === 'mobile' ? 1 : screenSize() === 'tablet' ? 2 : 3
    const slides: SlideContent[] = []

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

    setTimeout(() => {
      sliderRef = new KeenSlider(`#${slideId}`, {
        loop: true,
        slideChanged(s) {
          setCurrent(s.track.details.rel)
        },
      })
    })
  })

  createEffect(() => {
    const device = screenSize()
    setTimeout(() => {
      if (sliderRef) {
        sliderRef.update({
          loop: true,
          slides: { spacing: device === 'mobile' ? 5 : 16 },
        })
      }
    }, 1000)
  })

  const handleDotClick = (index: number) => {
    if (sliderRef) {
      sliderRef.moveToIdx(index)
    }
  }

  return (
    <div class="relative">
      <div
        id={slideId}
        class="keen-slider xl:max-w-[68%] m-auto h-[50vh] sm:h-[65vh] md:h-[70vh] lg:h-[80vh] mb-5 xl:mb-10"
      >
        <For each={groupedSlides()}>
          {(slide) => (
            <div class="keen-slider__slide flex flex-col h-full">
              {slide.images.length === 3 ? (
                <div class="flex flex-col md:flex-row gap-4 h-full">
                  <div class="flex flex-col md:flex-row flex-1 gap-4 h-full">
                    <div class="flex-1 overflow-hidden">
                      <img
                        src={slide.images[0]}
                        class="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                    </div>
                    <div class="flex flex-col gap-4 w-full md:w-1/2">
                      <div class="flex-1 overflow-hidden">
                        <img
                          src={slide.images[1]}
                          class="w-full h-full object-cover object-center"
                          loading="lazy"
                        />
                      </div>
                      <div class="flex-1 overflow-hidden">
                        <img
                          src={slide.images[2]}
                          class="w-full h-full object-cover object-center"
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

      <div class="flex justify-center gap-2">
        <For each={Array.from({ length: groupedSlides().length }, (_, i) => i)}>
          {(i) => (
            <button
              onClick={() => handleDotClick(i)}
              class={`w-7 h-2 transition-colors ${
                current() === i ? 'bg-black' : 'bg-gray-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          )}
        </For>
      </div>
    </div>
  )
}
