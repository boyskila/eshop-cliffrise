import type { Product, Translations } from '@types'

export const getProducts = (translations: Translations): Product[] => {
  const { product } = translations
  const { dryChalk, fingerTape, liquidChalk, tshirt, hat, wetChalk } = product
  return [
    {
      id: '1',
      name: dryChalk.name,
      price: 12.99,
      image: '/assets/products/dry-chalk.png',
      category: 'chalk',
      description: dryChalk.description,
      images: [
        '/assets/products/dry-chalk.png',
        '/assets/products/dry-chalk.png',
      ],
      kind: [],
    },
    {
      id: '2',
      name: fingerTape.name,
      price: 8.99,
      image: '/assets/products/finger-tape.png',
      category: 'chalk',
      description: fingerTape.description,
      images: [
        '/assets/products/tape/green.png',
        '/assets/products/tape/blue.png',
        '/assets/products/tape/yellow.png',
        '/assets/products/tape/orange.png',
        '/assets/products/tape/pink.png',
        '/assets/products/tape/black.png',
        '/assets/products/tape/white.png',
      ],
      kind: product.fingerTape.kind,
    },
    {
      id: '3',
      name: liquidChalk.name,
      price: 15.99,
      image: '/assets/products/dry-chalk.png',
      category: 'chalk',
      description: liquidChalk.description,
      images: [
        '/assets/products/liquid-chalk.png',
        '/assets/products/liquid-chalk-2.png',
      ],
      kind: [],
    },
    {
      id: '4',
      name: tshirt.name,
      price: 24.99,
      image: '/assets/products/tshirt/tshirt.png',
      category: 'apparel',
      description: tshirt.description,
      images: [
        '/assets/products/tshirt/tshirt.png',
        '/assets/products/tshirt/tshirt.png',
      ],
      kind: [
        { name: 's' },
        { name: 'm' },
        { name: 'l' },
        { name: 'xl' },
        { name: 'xxl' },
      ],
    },
    {
      id: '5',
      name: hat.name,
      price: 19.99,
      image: '/assets/products/beanies/red.png',
      category: 'apparel',
      description: hat.description,
      images: [
        '/assets/products/beanies/blue.png',
        '/assets/products/beanies/black.png',
        '/assets/products/beanies/red.png',
        '/assets/products/beanies/green.png',
        '/assets/products/beanies/gray.png',
      ],
      kind: product.hat.kind,
    },
    {
      id: '6',
      name: wetChalk.name,
      price: 12.99,
      image: '/assets/products/dry-chalk.png',
      category: 'chalk',
      description: wetChalk.description,
      images: [
        '/assets/products/dry-chalk.png',
        '/assets/products/dry-chalk.png',
      ],
      kind: [],
    },
  ]
}
