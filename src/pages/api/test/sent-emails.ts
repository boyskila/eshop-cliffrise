import type { APIRoute } from 'astro'
import {
  sentEmails,
  clearSentEmails,
} from '../../../services/email/FakeEmailService'

export const GET: APIRoute = async () => {
  const emails = sentEmails.map((mail) => mail)
  const response = new Response(JSON.stringify({ emails }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
  return response
}
