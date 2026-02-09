import { test, expect, type Page } from '@playwright/test'

const openContactFormModal = async (page: Page) => {
  const dialog = page.locator('#contactFormModal')
  const openButton = page.getByRole('button', {
    name: /свържи се с нас/i,
  })
  await openButton.click()
  return dialog
}

test.describe('Contact Form Modal - BG', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bg/')
  })
  test.afterEach(async ({ request, baseURL }) => {
    await request.get(`${baseURL}/api/test/delete-emails/`)
  })

  test('success message and form fields', async ({ page }) => {
    const dialog = await openContactFormModal(page)

    await dialog.getByPlaceholder('Име', { exact: true }).fill('John Doe')
    await dialog.getByPlaceholder('Имейл').fill('john@example.com')
    await dialog.getByPlaceholder('Съобщение').fill('This is a test message')

    const submitButton = dialog.getByRole('button', { name: 'Изпрати' })
    await submitButton.click()
    const successMessage = dialog.locator('[data-form-success-msg]')
    await expect(successMessage).toHaveText(
      /Благодарим ви, че се свързахте с нас! Ще ви отговорим възможно най-скоро./i,
    )
  })

  test('submit button text', async ({ page }) => {
    const dialog = await openContactFormModal(page)
    const submitButton = dialog.getByRole('button', {
      name: 'Изпрати',
    })
    await expect(submitButton).toContainText('Изпращане...')
    await expect(submitButton).toContainText('Изпрати')
  })

  test('header text and description', async ({ page }) => {
    const dialog = await openContactFormModal(page)

    await expect(
      dialog.getByRole('heading', { name: /подкрепи/i }),
    ).toBeVisible()
    await expect(dialog).toContainText(
      'Екипираме катерачни маршрути и облагородяваме зони за катерене. Ако искате да се включите, да подкрепите работата или просто имате въпрос, напишете ни и ще ви отговорим възможно най-скоро. ',
    )
  })
})
