import type { APIRoute } from 'astro'
import { clearSentEmails } from '../../../services/email/FakeEmailService'

export const DELETE: APIRoute = async () => {
  clearSentEmails()
  console.log('Sent emails cleared')
  return new Response(null, { status: 200 })
}
