import { Resend } from 'resend'
import type { EmailData, EmailResult, EmailService } from '@types'

export class ResendEmailService implements EmailService {
  private resend: Resend

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey)
  }

  async send(data: EmailData): Promise<EmailResult> {
    try {
      const { error } = await this.resend.emails.send({
        from: data.from,
        to: data.to,
        subject: data.subject,
        html: data.html,
        replyTo: data.replyTo,
      })
      return error
        ? { success: false, error: error.message }
        : { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  }
}
