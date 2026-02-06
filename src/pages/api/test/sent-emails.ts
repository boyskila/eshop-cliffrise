import type { APIRoute } from 'astro'
import {
  sentEmails,
  clearSentEmails,
} from '../../../services/email/FakeEmailService'

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ emails: sentEmails }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const DELETE: APIRoute = async () => {
  clearSentEmails()
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
