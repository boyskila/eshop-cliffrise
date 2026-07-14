import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { emailService } from '@services/email'
import { escapeHtml, sanitizeInput, sanitizeMessage } from '@utils/func'

const formatMultilineHtml = (value: string) => {
  return escapeHtml(value).replace(/\n/g, '<br>')
}

export const contact = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().transform(sanitizeInput).pipe(z.string().min(2).max(100)),
    email: z.string().trim().email().max(254),
    message: z
      .string()
      .transform(sanitizeMessage)
      .pipe(z.string().min(10).max(5000)),
  }),

  handler: async ({ name, email, message}) => {

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeMessage = formatMultilineHtml(message)
    const ownerEmail = import.meta.env.OWNER_EMAIL

    try {
      const result = await emailService.get().send({
        from: ownerEmail,
        to: ownerEmail,
        replyTo: email,
        subject: `[CliffRise] New message from ${safeName}`,
        bcc: [import.meta.env.BCC_EMAIL],
        html: `<!doctype html>
          <html lang="en">
            <body style="font-family: Arial, sans-serif; color: #1f2933; line-height: 1.5;">
              <h1 style="font-size: 20px; margin: 0 0 16px;">New contact form message</h1>
              <p style="margin: 0 0 8px;"><strong>Name:</strong> ${safeName}</p>
              <p style="margin: 0 0 16px;"><strong>Email:</strong> ${safeEmail}</p>
              <div style="margin: 0;">
                <strong>Message:</strong>
                <p style="margin: 8px 0 0;">${safeMessage}</p>
              </div>
            </body>
          </html>`,
      })

      if (!result.success) {
        console.error('Contact email send error:', {
          error: result.error,
          messageLength: message.length,
        })
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message.',
        })
      }

      return { success: true }
    } catch (err) {
      if (err instanceof ActionError) {
        throw err
      }

      console.error('Unexpected contact email error:', err)
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send message.',
      })
    }
  },
})
