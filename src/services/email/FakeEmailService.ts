import type { EmailData, EmailResult, EmailService } from '@types'

export const sentEmails: EmailData[] = []

export class FakeEmailService implements EmailService {
  async send(data: EmailData): Promise<EmailResult> {
    // await new Promise((resolve) => setTimeout(resolve, 2000))
    sentEmails.push(data)
    return { success: true }
  }
}

export function clearSentEmails(): void {
  sentEmails.length = 0
}
