import type { EmailService } from '@types'
import { ResendEmailService } from './ResendEmailService'

class EmailServiceSingleton {
  private static instance: EmailService | null = null

  static getInstance(): EmailService {
    if (EmailServiceSingleton.instance) {
      return EmailServiceSingleton.instance
    }

    EmailServiceSingleton.instance = new ResendEmailService(
      import.meta.env.RESEND_API_KEY,
    )

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
