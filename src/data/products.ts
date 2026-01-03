import type { Product, Translations } from '../types'

export const getProducts = (translations: Translations): Product[] => {
  const { product } = translations
  return [
    {
      id: '1',
      name: product.chalk.name,
      price: 12.99,
      image:
        'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      category: 'chalk',
      description: product.chalk.description,
      features: product.chalk.features,
    },
    {
      id: '2',
      name: product.chalkBall.name,
      price: 8.99,
      image:
        'https://images.pexels.com/photos/1031641/pexels-photo-1031641.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      category: 'chalk',
      description: product.chalkBall.description,
      features: product.chalkBall.features,
    },
    {
      id: '3',
      name: product.liquidChalk.name,
      price: 15.99,
      image:
        'https://images.pexels.com/photos/1571442/pexels-photo-1571442.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      category: 'chalk',
      description: product.liquidChalk.description,
      features: product.liquidChalk.features,
    },
    {
      id: '4',
      name: product.tshirt.name,
      price: 24.99,
      image:
        'https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      category: 'apparel',
      description: product.tshirt.description,
      features: product.tshirt.features,
    },
    {
      id: '5',
      name: product.hat.name,
      price: 19.99,
      image:
        'https://images.pexels.com/photos/1261578/pexels-photo-1261578.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      category: 'apparel',
      description: product.hat.description,
      features: product.hat.features,
    },
  ]
}
