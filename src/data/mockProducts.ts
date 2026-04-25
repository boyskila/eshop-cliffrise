import type { Product } from '@types'
import { PRODUCT_IMAGES } from './productImages'
export const resolveImage = (key: string): ImageMetadata | string => {
  const productImage = PRODUCT_IMAGES[`/src/assets/images/products/${key}`]
  return productImage ? productImage.default : key
}

type MockProductsMap = Record<string, Product[]>

const enProducts: Product[] = [
  {
    id: '1',
    slug: '1',
    href: '/en/products/1/',
    name: 'Chunky Chalk',
    description:
      'Chunky climbing chalk with a coarse structure that breaks down easily and provides reliable friction. Made for bouldering, sport routes and long climbing sessions. Open. Crush. Climb.',
    kind: [],
    price: 12.99,
    weight: 0.3,
    image: resolveImage('dry-chalk/dry-chalk'),
    images: [
      resolveImage('dry-chalk/dry-chalk'),
      resolveImage('wet-chalk/dry-chalk'),
      resolveImage('liquid-chalk/dry-chalk'),
    ],
    productPageTitle: 'Chunky Chalk – 250 g',
  },
  {
    id: '2',
    slug: '2',
    href: '/en/products/2/',
    name: 'Moist Chunky Chalk',
    description:
      'Moist chunky climbing chalk with a denser structure that breaks down easily and leaves an even layer on the hands. Made for bouldering, sport routes and long climbing sessions. Open. Crush. Climb.',
    kind: [],
    price: 13.99,
    weight: 0.3,
    image: resolveImage('wet-chalk/dry-chalk'),
    images: [resolveImage('wet-chalk/dry-chalk')],
    productPageTitle: 'Moist Chunky Chalk – 250g',
  },
  {
    id: '3',
    slug: '3',
    href: '/en/products/3/',
    name: 'Liquid Chalk',
    description:
      'Liquid chalk that dries quickly and leaves an even layer on the hands. Made for reliable friction both indoors and outdoors.',
    kind: [],
    price: 14.99,
    weight: 0.3,
    image: resolveImage('liquid-chalk/dry-chalk'),
    images: [resolveImage('liquid-chalk/dry-chalk')],
    productPageTitle: 'Liquid Chalk – 250 ml',
  },
  {
    id: '4',
    slug: '4',
    href: '/en/products/4/',
    name: 'T‑Shirt with a Cause',
    description:
      'Comfortable T‑shirt for climbing and for the days between routes. Simple, durable and made for people who love climbing.',
    kind: [
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: true },
      { name: 'XL', inStock: true },
    ],
    kindTitle: 'Select size:',
    price: 29.99,
    weight: 0.25,
    image: resolveImage('tshirt/tshirt'),
    images: [resolveImage('tshirt/tshirt')],
  },
  {
    id: '5',
    slug: '5',
    href: '/en/products/5/',
    name: 'Beanie with a Cause',
    description:
      'Warm beanie for cold days in the mountains and in the city. Comfortable, simple and made for climbing adventures.',
    kind: [
      { name: 'blue', image: resolveImage('beanies/blue'), inStock: true },
      { name: 'black', image: resolveImage('beanies/black'), inStock: true },
      { name: 'red', image: resolveImage('beanies/red'), inStock: true },
      { name: 'green', image: resolveImage('beanies/green'), inStock: true },
      { name: 'gray', image: resolveImage('beanies/gray'), inStock: true },
    ],
    kindTitle: 'Select color:',
    price: 24.99,
    weight: 0.1,
    image: resolveImage('beanies/blue'),
    images: [resolveImage('beanies/blue')],
  },
  {
    id: '6',
    slug: '6',
    href: '/en/products/6/',
    name: 'Climbing Tape',
    description:
      'Durable tape for protecting fingers while climbing. Made for crack climbing, sharp holds and long climbing sessions.',
    kind: [
      { name: 'green', image: resolveImage('tape/green'), inStock: true },
      { name: 'blue', image: resolveImage('tape/blue'), inStock: true },
      { name: 'yellow', image: resolveImage('tape/yellow'), inStock: true },
      { name: 'orange', image: resolveImage('tape/orange'), inStock: true },
      { name: 'pink', image: resolveImage('tape/pink'), inStock: true },
      { name: 'black', image: resolveImage('tape/black'), inStock: true },
      { name: 'white', image: resolveImage('tape/white'), inStock: true },
    ],
    kindTitle: 'Select color:',
    price: 7.99,
    weight: 0.05,
    image: resolveImage('tape/green'),
    images: [resolveImage('tape/green')],
  },
]

const bgProducts: Product[] = [
  {
    id: '1',
    slug: '1',
    href: '/bg/products/1/',
    weight: 0.3,
    name: 'Сух магнезий на бучка',
    description:
      'Магнезий на бучка с едра структура, който се раздробява лесно и осигурява стабилно сцепление. Създаден за боулдър, спортни маршрути и дълги катерачни сесии. Отваряш. Натрошаваш. Катериш.',
    kind: [],
    price: 12.99,
    image: resolveImage('dry-chalk/dry-chalk'),
    images: [
      resolveImage('dry-chalk/dry-chalk'),
      resolveImage('wet-chalk/dry-chalk'),
      resolveImage('liquid-chalk/dry-chalk'),
    ],
    productPageTitle: 'Сух магнезий на бучка – 250гр',
  },
  {
    id: '2',
    slug: '2',
    href: '/bg/products/2/',
    weight: 0.3,
    name: 'Влажен магнезий на бучка',
    description:
      'Магнезий на бучка с по‑плътна структура, който се раздробява лесно и оставя равномерен слой по ръцете. Създаден за боулдър, спортни маршрути и дълги катерачни сесии. Отваряш. Натрошаваш. Катериш.',
    kind: [],
    price: 13.99,
    image: resolveImage('wet-chalk/dry-chalk'),
    images: [resolveImage('wet-chalk/dry-chalk')],
    productPageTitle: 'Влажен магнезий на бучка – 250гр',
  },
  {
    id: '3',
    slug: '3',
    href: '/bg/products/3/',
    weight: 0.3,
    name: 'Течен магнезий',
    description:
      'Течен магнезий, който изсъхва бързо и оставя равномерен слой по ръцете. Създаден за стабилно сцепление при катерене в зала и навън.',
    kind: [],
    price: 14.99,
    image: resolveImage('liquid-chalk/dry-chalk'),
    images: [resolveImage('liquid-chalk/dry-chalk')],
    productPageTitle: 'Течен магнезий – 250 мл',
  },
  {
    id: '4',
    slug: '4',
    href: '/bg/products/4/',
    name: 'Тениска с кауза',
    description:
      'Удобна тениска за катерене и за дните между маршрутите. Семпла, здрава и създадена за хората, които обичат катеренето.',
    kind: [
      { name: 'S', inStock: true },
      { name: 'M', inStock: true },
      { name: 'L', inStock: true },
      { name: 'XL', inStock: true },
    ],
    kindTitle: 'Изберете размер:',
    price: 29.99,
    weight: 0.25,
    image: resolveImage('tshirt/tshirt'),
    images: [resolveImage('tshirt/tshirt')],
  },
  {
    id: '5',
    slug: '5',
    href: '/bg/products/5/',
    name: 'Шапка с кауза',
    description:
      'Топла шапка за студените дни в планината и в града. Удобна, семпла и създадена за катерачни приключения.',
    kind: [
      { name: 'син', image: resolveImage('beanies/blue'), inStock: true },
      { name: 'черен', image: resolveImage('beanies/black'), inStock: true },
      { name: 'червен', image: resolveImage('beanies/red'), inStock: true },
      { name: 'зелен', image: resolveImage('beanies/green'), inStock: true },
      { name: 'сив', image: resolveImage('beanies/gray'), inStock: true },
    ],
    kindTitle: 'Изберете цвят:',
    price: 24.99,
    weight: 0.1,
    image: resolveImage('beanies/blue'),
    images: [resolveImage('beanies/blue')],
  },
  {
    id: '6',
    slug: '6',
    href: '/bg/products/6/',
    name: 'Катерачен тейп',
    description:
      'Здрав тейп за защита на пръстите при катерене. Създаден за цепки, остри хватки и дълги катерачни сесии.',
    kind: [
      { name: 'зелен', image: resolveImage('tape/green'), inStock: true },
      { name: 'син', image: resolveImage('tape/blue'), inStock: true },
      { name: 'жълт', image: resolveImage('tape/yellow'), inStock: true },
      { name: 'оранжев', image: resolveImage('tape/orange'), inStock: true },
      { name: 'розов', image: resolveImage('tape/pink'), inStock: true },
      { name: 'черен', image: resolveImage('tape/black'), inStock: true },
      { name: 'бял', image: resolveImage('tape/white'), inStock: true },
    ],
    kindTitle: 'Изберете цвят:',
    price: 7.99,
    weight: 0.05,
    image: resolveImage('tape/green'),
    images: [resolveImage('tape/green')],
  },
]

const mockProducts: MockProductsMap = {
  en: enProducts,
  bg: bgProducts,
}

export const getMockProducts = (lang: string): Product[] => {
  return mockProducts[lang] ?? mockProducts.en
}
