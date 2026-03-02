import type { APIRoute } from 'astro'
import { clearSentEmails } from '../../../services/email/FakeEmailService'
import { clearRateLimitStore } from '../../../services/rateLimit'

export const GET: APIRoute = async () => {
  clearSentEmails()
  clearRateLimitStore()
  console.log('Sent emails cleared')
  return new Response(null, { status: 200 })
}
