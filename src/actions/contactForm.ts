import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { emailService } from '@services/email'
import { checkRateLimit } from '@services/rateLimit'
import { escapeHtml, sanitizeInput, sanitizeMessage } from '@utils/func'

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
    email: z.string().trim().email().max(254),
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

    try {
      const result = await emailService.get().send({
        from: import.meta.env.OWNER_EMAIL,
        to: safeEmail,
        subject: `[CliffRise] New message from ${safeName}`,
        bcc: [import.meta.env.BCC_EMAIL_ONE, import.meta.env.BCC_EMAIL_TWO],
        template: {
          id: import.meta.env.RESEND_CONTACT_TEMPLATE_ID,
          variables: {
            name: safeName,
            email: safeEmail,
            message: escapeHtml(message).replace(/\n/g, '<br>'),
          },
        },
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
