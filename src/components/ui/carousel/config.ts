import { type EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'

export const CAROUSEL_OPTIONS: () => Partial<EmblaOptionsType> = () => ({
  loop: true,
  slidesToScroll: 1,
  align: 'start',
})

export const CAROUSEL_PLUGINS = () => [
  Autoplay({
    delay: 3000,
    playOnInit: true,
    stopOnMouseEnter: true,
    stopOnInteraction: false,
  }),
]
