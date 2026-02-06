import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import { emailService } from '@services/email'

export const contact = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    message: z.string().min(10),
    company: z.string().optional(),
  }),

  handler: async ({ name, email, message, company }, ctx) => {
    // Honeypot spam protection
    if (company) {
      return { success: true }
    }

    const ip =
      ctx.request.headers.get('x-forwarded-for') ??
      ctx.request.headers.get('cf-connecting-ip') ??
      'unknown'

    try {
      const result = await emailService.get().send({
        from: 'CliffRise Contact <onboarding@resend.dev>',
        to: 'boiskila@gmail.com',
        subject: `[CliffRise] New message from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            IP: ${ip}
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
