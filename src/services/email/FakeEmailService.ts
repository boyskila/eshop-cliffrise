import type { EmailData, EmailResult, EmailService } from '@types'

export const sentEmails: (EmailData & { html?: string })[] = []

export class FakeEmailService implements EmailService {
  async send(data: EmailData): Promise<EmailResult> {
    // Synthesize html from template variables so tests can assert on content
    if (
      'template' in data &&
      data.template?.variables &&
      !('html' in data && data.html)
    ) {
      const vars = data.template.variables
      const html = Object.values(vars).join(' ')
      sentEmails.push({ ...data, html } as unknown as EmailData & {
        html: string
      })
    } else {
      sentEmails.push(data)
    }
    return { success: true }
  }
}

export const clearSentEmails = () => {
  sentEmails.length = 0
  return sentEmails
}
