import { For } from 'solid-js'
import useEmblaCarousel from 'embla-carousel-solid'
import { CAROUSEL_OPTIONS } from './config'
import Arrows from './ContainerWithArrows'

const feedbacks = [
  {
    author: 'Ivan Petrov',
    text: 'Great products and excellent customer service! Highly recommend CliffRise for all climbing enthusiasts.',
    image: '/assets/matei.png',
  },
  {
    author: 'Maria Dimitrova',
    text: 'I love the quality and durability of the climbing gear from CliffRise. It has never let me down during my climbs.',
    image: '/assets/matei.png',
  },
  {
    author: 'Georgi Ivanov',
    text: 'CliffRise offers an amazing selection of climbing gear at competitive prices. Their customer support is top-notch!',
    image: '/assets/matei.png',
  },
  {
    author: 'Elena Kolarova',
    text: 'The team at CliffRise is knowledgeable and passionate about climbing. They helped me find the perfect gear for my needs.',
    image: '/assets/matei.png',
  },
  {
    author: 'Dimitar Stoyanov',
    text: 'Fast shipping and great packaging! My order from CliffRise arrived quickly and in perfect condition.',
    image: '/assets/matei.png',
  },
  {
    author: 'Nina Petrova',
    text: 'CliffRise is my go-to store for all things climbing. Their products are reliable, and their prices are unbeatable.',
    image: '/assets/matei.png',
  },
]

export default () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(CAROUSEL_OPTIONS)

  return (
    <Arrows api={emblaApi!}>
      <div class="overflow-hidden" ref={emblaRef}>
        <div class="flex touch-pan-y touch-pinch-zoom h-[240px] items-center">
          <For each={feedbacks}>
            {({ text, author, image }) => (
              <div
                classList={{
                  'landscape:flex-[0_0_45%] landscape:lg:flex-[0_0_40%] landscape:2xl:flex-[0_0_24.5%] me-3': true,
                  'flex-[0_0_90%] md:flex-[0_0_40%] xl:flex-[0_0_33.33%] h-[70%]': true,
                }}
              >
                <div class="p-4 bg-[#f7f7f7] h-full">
                  <img src={image} alt={author} class="size-20 -mt-13 ml-2" />
                  <p class="ml-25 -mt-7 text-xl font-bold">- {author}</p>
                  <p class="mt-5">{text}</p>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </Arrows>
  )
}
