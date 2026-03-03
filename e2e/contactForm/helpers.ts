import type { APIRequestContext, Page } from '@playwright/test'

export const openContactFormModal = async (
  page: Page,
  buttonName: RegExp = /contact us|свържи се с нас/i,
) => {
  const dialog = page.locator('#contactFormModal')
  const openButton = page.getByRole('button', { name: buttonName })
  await openButton.click()
  return dialog
}

export const submitContactAction = async (
  request: APIRequestContext,
  payload: {
    name: string
    email: string
    message: string
    company?: string
  },
  headers?: Record<string, string>,
) =>
  request.post('/_actions/contact/', {
    headers: {
      origin: 'http://127.0.0.1:4321',
      accept: 'application/json',
      ...headers,
    },
    multipart: {
      name: payload.name,
      email: payload.email,
      message: payload.message,
      company: payload.company ?? '',
    },
  })
