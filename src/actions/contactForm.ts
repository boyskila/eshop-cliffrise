import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { emailService } from '@services/email'
import { checkRateLimit } from '@services/rateLimit'
import { escapeHtml } from '@utils/func'

// Replaces ASCII control characters with a space:
const sanitizeInput = (value: string) =>
  value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// For the message field, we want to allow newlines, so we only remove the non-printable control chars and DEL, but keep tabs and newlines.
// This allows users to format their messages with line breaks.
const sanitizeMessage = (value: string) =>
  value
    // Removes non-printable control chars. Allows tabs (\t), newlines (\n, \r), but removes others that could be used for obfuscation.
    // Intentionally keeps \n (LF, \u000A) and \r (\u000D) so line breaks can be normalized next.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Normalizes Windows newlines to Unix newline format for consistency.
    .replace(/\r\n/g, '\n')
    .trim()

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }
  return request.headers.get('cf-connecting-ip') ?? 'unknown'
}

const rateLimitMax = Number(import.meta.env.CONTACT_RATE_LIMIT_MAX ?? 5)
const rateLimitWindowMs = Number(
  import.meta.env.CONTACT_RATE_LIMIT_WINDOW_MS ?? 60_000,
)

export const contact = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().transform(sanitizeInput).pipe(z.string().min(2).max(100)),
    email: z
      .string()
      .transform(sanitizeInput)
      .pipe(z.string().email().max(254)),
    message: z
      .string()
      .transform(sanitizeMessage)
      .pipe(z.string().min(10).max(5000)),
    company: z.string().optional(),
  }),

  handler: async ({ name, email, message, company }, ctx) => {
    // Honeypot spam protection
    if (company) {
      return { success: true }
    }

    const ip = getClientIp(ctx.request)
    const rateLimit = checkRateLimit({
      key: `contact:${ip}`,
      limit: rateLimitMax,
      windowMs: rateLimitWindowMs,
    })

    if (!rateLimit.allowed) {
      throw new ActionError({
        code: 'TOO_MANY_REQUESTS',
        message: `Too many requests. Try again in ${rateLimit.retryAfterSeconds}s.`,
      })
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>')
    const safeIp = escapeHtml(ip)

    try {
      const result = await emailService.get().send({
        from: 'CliffRise Contact <onboarding@resend.dev>',
        to: 'boiskila@gmail.com',
        subject: `[CliffRise] New message from ${safeName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            IP: ${safeIp}
          </p>
        `,
        replyTo: email,
      })

      if (!result.success) {
        console.error('Email send error:', result.error)
        throw new Error('Failed to send email')
      }

      return { success: true }
    } catch (err) {
      console.error('ResendEmailService error:', err)
    }
  },
})
