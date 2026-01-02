import { getTranslations } from '../../lib/i18/getTranslations'
import { DEFAULT_LANG } from '../constants'
import type { Product } from '../types'

export const getProducts = (lang = DEFAULT_LANG): Product[] => {
  const t = getTranslations(lang)
  const { product } = t
  return [
    {
      id: '1',
      name: product.chalk.name,
      price: 12.99,
      image:
        'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      category: 'chalk',
      description: product.chalk.description,
      features: [
        '99% pure magnesium carbonate',
        'Fine texture for optimal coverage',
        '100g packet',
        'Eco-friendly packaging',
      ],
    },
    {
      id: '2',
      name: product.chalkBall.name,
      price: 8.99,
      image:
        'https://images.pexels.com/photos/1031641/pexels-photo-1031641.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      category: 'chalk',
      description: product.chalkBall.description,
      features: [
        'Refillable sock design',
        'Even chalk distribution',
        'No waste formula',
        'Perfect for gym climbing',
      ],
    },
    {
      id: '3',
      name: product.liquidChalk.name,
      price: 15.99,
      image:
        'https://images.pexels.com/photos/1571442/pexels-photo-1571442.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      category: 'chalk',
      description: product.liquidChalk.description,
      features: [
        'Quick-drying formula',
        '250ml bottle',
        'Long-lasting grip',
        'Perfect base layer',
      ],
    },
    {
      id: '4',
      name: product.tshirt.name,
      price: 24.99,
      image:
        'https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      category: 'apparel',
      description: product.tshirt.description,
      features: [
        '100% organic cotton',
        'Screen-printed logo',
        'Available in S-XXL',
        'Sustainable production',
      ],
    },
    {
      id: '5',
      name: product.hat.name,
      price: 19.99,
      image:
        'https://images.pexels.com/photos/1261578/pexels-photo-1261578.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      category: 'apparel',
      description: product.hat.description,
      features: [
        'Adjustable strap',
        'UV protection',
        'Moisture-wicking fabric',
        'Embroidered logo',
      ],
    },
  ]
}
