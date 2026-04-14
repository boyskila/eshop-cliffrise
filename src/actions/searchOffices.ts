import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import type { SpeedyOffice } from '@types'
import { SPEEDY_API_URL } from '@services/speedyOffices'

export const searchOffices = defineAction({
  input: z.object({
    query: z.string().min(2).max(100),
    lang: z.enum(['bg', 'en']).default('bg'),
  }),

  handler: async ({ query, lang }) => {
    const username = import.meta.env.SPEEDY_USERNAME
    const password = import.meta.env.SPEEDY_PASSWORD

    const body = {
      userName: username,
      password: password,
      countryId: 100, // Bulgaria
      name: query,
    }

    try {
      const response = await fetch(SPEEDY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        console.error(
          'Speedy API error:',
          response.status,
          await response.text(),
        )
        return { offices: [] }
      }

      const data = (await response.json()) as { offices: SpeedyOffice[] }
      const offices = (data.offices ?? []).map((office) => {
        const { id, address, name, nameEn, type } = office
        const { fullAddressString, fullAddressStringEn } = address ?? {}
        return {
          id,
          name: lang === 'en' ? (nameEn ?? name) : (name ?? nameEn),
          address:
            lang === 'en'
              ? (fullAddressStringEn ?? fullAddressString)
              : (fullAddressString ?? fullAddressStringEn),
          type, // OFFICE or APT (automat)
        }
      })

      return { offices }
    } catch (err) {
      console.error('Speedy office search failed:', err)
      return { offices: [] }
    }
  },
})
