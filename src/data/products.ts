import type { Product, Translations } from '@types'

export const getProducts = (translations: Translations): Product[] => {
  const { product } = translations
  const baseUrl = import.meta.env.BASE_URL
  return [
    {
      id: '1',
      name: product.dryChalk.name,
      price: 12.99,
      image: `${baseUrl}assets/products/dry-chalk.png`,
      category: 'chalk',
      description: product.dryChalk.description,
      features: product.dryChalk.features,
    },
    {
      id: '2',
      name: product.fingerTape.name,
      price: 8.99,
      image: `${baseUrl}assets/products/finger-tape.png`,
      category: 'chalk',
      description: product.fingerTape.description,
      features: product.fingerTape.features,
    },
    {
      id: '3',
      name: product.liquidChalk.name,
      price: 15.99,
      image: `${baseUrl}assets/products/dry-chalk.png`,
      category: 'chalk',
      description: product.liquidChalk.description,
      features: product.liquidChalk.features,
    },
    {
      id: '4',
      name: product.tshirt.name,
      price: 24.99,
      image: `${baseUrl}assets/products/finger-tape-green.png`,
      category: 'apparel',
      description: product.tshirt.description,
      features: product.tshirt.features,
    },
    {
      id: '5',
      name: product.hat.name,
      price: 19.99,
      image: `${baseUrl}assets/products/dry-chalk.png`,
      category: 'apparel',
      description: product.hat.description,
      features: product.hat.features,
    },
    {
      id: '1',
      name: product.wetChalk.name,
      price: 12.99,
      image: `${baseUrl}assets/products/dry-chalk.png`,
      category: 'chalk',
      description: product.wetChalk.description,
      features: product.wetChalk.features,
    },
  ]
}
