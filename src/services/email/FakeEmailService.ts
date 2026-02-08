import type { EmailData, EmailResult, EmailService } from '@types'

export const sentEmails: EmailData[] = []

export class FakeEmailService implements EmailService {
  async send(data: EmailData): Promise<EmailResult> {
    sentEmails.push(data)
    return { success: true }
  }
}

export const clearSentEmails = () => {
  sentEmails.length = 0
  return sentEmails
}
