import type { ImageMetadata } from 'astro'
import img056 from '@assets/images/gallery/CliffriseTetevenMeetup2025-056.webp'
import img072 from '@assets/images/gallery/CliffriseTetevenMeetup2025-072.webp'
import img096 from '@assets/images/gallery/CliffriseTetevenMeetup2025-096.webp'
import img117 from '@assets/images/gallery/CliffriseTetevenMeetup2025-117.webp'
import img142 from '@assets/images/gallery/CliffriseTetevenMeetup2025-142.webp'
import img162 from '@assets/images/gallery/CliffriseTetevenMeetup2025-162.webp'
import img172 from '@assets/images/gallery/CliffriseTetevenMeetup2025-172.webp'
import img020 from '@assets/images/gallery/CliffriseTetevenMeetup2025-020.webp'
import img260 from '@assets/images/gallery/CliffriseTetevenMeetup2025-260.webp'
import img425 from '@assets/images/gallery/CliffriseTetevenMeetup2025-425.webp'
import img427 from '@assets/images/gallery/CliffriseTetevenMeetup2025-427.webp'
import img428 from '@assets/images/gallery/CliffriseTetevenMeetup2025-428.webp'

import boltingImg from '@assets/images/founders/boyko/gallery/bolting.webp'
import tetevenImg from '@assets/images/founders/boyko/gallery/teteven.webp'
import dryTooling from '@assets/images/founders/boyko/gallery/dry-tooling.webp'
import aliBabatch from '@assets/images/founders/boyko/gallery/ali-babatch.webp'
import klisuraGreece from '@assets/images/founders/boyko/gallery/klisura-greece.webp'
import ribaritsaBolting from '@assets/images/founders/boyko/gallery/ribaritsa-bolting.webp'

export const galleryImages: ImageMetadata[] = [
  img056,
  img072,
  img096,
  img117,
  img142,
  img162,
  img172,
  img020,
  img260,
  img425,
  img427,
  img428,
]

export const boykoImages: ImageMetadata[] = [
  klisuraGreece,
  boltingImg,
  tetevenImg,
  dryTooling,
  aliBabatch,
  ribaritsaBolting,
]
export const alexImages: ImageMetadata[] = [...galleryImages]
