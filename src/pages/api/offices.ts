import type { APIRoute } from 'astro'
import { getCachedOffices } from '@services/speedyOffices'

export const GET: APIRoute = async () => {
  const offices = await getCachedOffices()
  return new Response(JSON.stringify(offices), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
