import type { EmailService } from '@types'
import { FakeEmailService } from './FakeEmailService'
import { ResendEmailService } from './ResendEmailService'
import { isTestMode } from '@utils/func'

export { sentEmails, clearSentEmails } from './FakeEmailService'

class EmailServiceSingleton {
  private static instance: EmailService | null = null

  static getInstance(): EmailService {
    if (EmailServiceSingleton.instance) {
      return EmailServiceSingleton.instance
    }

    if (isTestMode) {
      EmailServiceSingleton.instance = new FakeEmailService()
    } else {
      EmailServiceSingleton.instance = new ResendEmailService(
        import.meta.env.RESEND_API_KEY,
      )
    }
    return EmailServiceSingleton.instance as any
  }

  static setInstance(service: EmailService): void {
    EmailServiceSingleton.instance = service
  }

  static resetInstance(): void {
    EmailServiceSingleton.instance = null
  }
}

export const emailService = {
  get: () => EmailServiceSingleton.getInstance(),
  set: (service: EmailService) => EmailServiceSingleton.setInstance(service),
  reset: () => EmailServiceSingleton.resetInstance(),
}
