import type { Product } from '@types'

type MockProductsMap = Record<string, Product[]>

const enProducts: Product[] = [
  {
    id: '1',
    name: 'Chunky Chalk – 250 g',
    description:
      'Chunky climbing chalk with a coarse structure that breaks down easily and provides reliable friction. Made for bouldering, sport routes and long climbing sessions. Open. Crush. Climb.',
    kind: [],
    price: 12.99,
    weight: 0.3,
    image: '/assets/products/dry-chalk/main.png',
    images: [
      '/assets/products/dry-chalk/main.png',
      '/assets/products/dry-chalk/dry-chalk-1.png',
      '/assets/products/dry-chalk/dry-chalk-2.png',
    ],
  },
  {
    id: '2',
    name: 'Moist Chunky Chalk – 250 g',
    description:
      'Moist chunky climbing chalk with a denser structure that breaks down easily and leaves an even layer on the hands. Made for bouldering, sport routes and long climbing sessions. Open. Crush. Climb.',
    kind: [],
    price: 13.99,
    weight: 0.3,
    image: '/assets/products/wet-chalk/main.png',
    images: [
      '/assets/products/wet-chalk/main.png',
      '/assets/products/wet-chalk/wet-chalk-1.png',
    ],
  },
  {
    id: '3',
    name: 'Liquid Chalk - 250 ml',
    description:
      'Liquid chalk that dries quickly and leaves an even layer on the hands. Made for reliable friction both indoors and outdoors.',
    kind: [],
    price: 14.99,
    weight: 0.3,
    image: '/assets/products/liquid-chalk/main.png',
    images: ['/assets/products/liquid-chalk/main.png'],
  },
  {
    id: '4',
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
    image: '/assets/products/tshirt/main.png',
    images: ['/assets/products/tshirt/main.png'],
  },
  {
    id: '5',
    name: 'Beanie with a Cause',
    description:
      'Warm beanie for cold days in the mountains and in the city. Comfortable, simple and made for climbing adventures.',
    kind: [
      {
        name: 'blue',
        image: '/assets/products/beanies/blue.png',
        inStock: true,
      },
      {
        name: 'black',
        image: '/assets/products/beanies/black.png',
        inStock: true,
      },
      {
        name: 'red',
        image: '/assets/products/beanies/red.png',
        inStock: true,
      },
      {
        name: 'green',
        image: '/assets/products/beanies/green.png',
        inStock: true,
      },
      {
        name: 'gray',
        image: '/assets/products/beanies/gray.png',
        inStock: true,
      },
    ],
    kindTitle: 'Select color:',
    price: 24.99,
    weight: 0.1,
    image: '/assets/products/beanies/main.png',
    images: ['/assets/products/beanies/main.png'],
  },
  {
    id: '6',
    name: 'Climbing Tape',
    description:
      'Durable tape for protecting fingers while climbing. Made for crack climbing, sharp holds and long climbing sessions.',
    kind: [
      {
        name: 'green',
        image: '/assets/products/tape/green.png',
        inStock: true,
      },
      {
        name: 'blue',
        image: '/assets/products/tape/blue.png',
        inStock: true,
      },
      {
        name: 'yellow',
        image: '/assets/products/tape/yellow.png',
        inStock: true,
      },
      {
        name: 'orange',
        image: '/assets/products/tape/orange.png',
        inStock: true,
      },
      {
        name: 'pink',
        image: '/assets/products/tape/pink.png',
        inStock: true,
      },
      {
        name: 'black',
        image: '/assets/products/tape/black.png',
        inStock: true,
      },
      {
        name: 'white',
        image: '/assets/products/tape/white.png',
        inStock: true,
      },
    ],
    kindTitle: 'Select color:',
    price: 7.99,
    weight: 0.05,
    image: '/assets/products/tape/main.png',
    images: ['/assets/products/tape/main.png'],
  },
]

const bgProducts: Product[] = [
  {
    id: '1',
    weight: 0.3,
    name: 'Сух магнезий на бучка – 250 гр',
    description:
      'Магнезий на бучка с едра структура, който се раздробява лесно и осигурява стабилно сцепление. Създаден за боулдър, спортни маршрути и дълги катерачни сесии. Отваряш. Натрошаваш. Катериш.',
    kind: [],
    price: 12.99,
    image: '/assets/products/dry-chalk/main.png',
    images: [
      '/assets/products/dry-chalk/main.png',
      '/assets/products/dry-chalk/dry-chalk-1.png',
      '/assets/products/dry-chalk/dry-chalk-2.png',
    ],
  },
  {
    id: '2',
    weight: 0.3,
    name: 'Влажен магнезий на бучка – 250 гр',
    description:
      'Магнезий на бучка с по‑плътна структура, който се раздробява лесно и оставя равномерен слой по ръцете. Създаден за боулдър, спортни маршрути и дълги катерачни сесии. Отваряш. Натрошаваш. Катериш.',
    kind: [],
    price: 13.99,
    image: '/assets/products/wet-chalk/main.png',
    images: ['/assets/products/wet-chalk/main.png'],
  },
  {
    id: '3',
    weight: 0.3,
    name: 'Течен магнезий – 250 мл',
    description:
      'Течен магнезий, който изсъхва бързо и оставя равномерен слой по ръцете. Създаден за стабилно сцепление при катерене в зала и навън.',
    kind: [],
    price: 14.99,
    image: '/assets/products/liquid-chalk/main.png',
    images: ['/assets/products/liquid-chalk/main.png'],
  },
  {
    id: '4',
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
    image: '/assets/products/tshirt/main.png',
    images: ['/assets/products/tshirt/main.png'],
  },
  {
    id: '5',
    name: 'Шапка с кауза',
    description:
      'Топла шапка за студените дни в планината и в града. Удобна, семпла и създадена за катерачни приключения.',
    kind: [
      {
        name: 'син',
        image: '/assets/products/beanies/blue.png',
        inStock: true,
      },
      {
        name: 'черен',
        image: '/assets/products/beanies/black.png',
        inStock: true,
      },
      {
        name: 'червен',
        image: '/assets/products/beanies/red.png',
        inStock: true,
      },
      {
        name: 'зелен',
        image: '/assets/products/beanies/green.png',
        inStock: true,
      },
      {
        name: 'сив',
        image: '/assets/products/beanies/gray.png',
        inStock: true,
      },
    ],
    kindTitle: 'Изберете цвят:',
    price: 24.99,
    weight: 0.1,
    image: '/assets/products/beanies/main.png',
    images: ['/assets/products/beanies/main.png'],
  },
  {
    id: '6',
    name: 'Катерачен тейп',
    description:
      'Здрав тейп за защита на пръстите при катерене. Създаден за цепки, остри хватки и дълги катерачни сесии.',
    kind: [
      {
        name: 'зелен',
        image: '/assets/products/tape/green.png',
        inStock: true,
      },
      {
        name: 'син',
        image: '/assets/products/tape/blue.png',
        inStock: true,
      },
      {
        name: 'жълт',
        image: '/assets/products/tape/yellow.png',
        inStock: true,
      },
      {
        name: 'оранжев',
        image: '/assets/products/tape/orange.png',
        inStock: true,
      },
      {
        name: 'розов',
        image: '/assets/products/tape/pink.png',
        inStock: true,
      },
      {
        name: 'черен',
        image: '/assets/products/tape/black.png',
        inStock: true,
      },
      {
        name: 'бял',
        image: '/assets/products/tape/white.png',
        inStock: true,
      },
    ],
    kindTitle: 'Изберете цвят:',
    price: 7.99,
    weight: 0.05,
    image: '/assets/products/tape/main.png',
    images: ['/assets/products/tape/main.png'],
  },
]

const mockProducts: MockProductsMap = {
  en: enProducts,
  bg: bgProducts,
}

export const getMockProducts = (lang: string): Product[] => {
  return mockProducts[lang] ?? mockProducts.en
}
