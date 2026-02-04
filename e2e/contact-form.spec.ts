import { test, expect } from '@playwright/test'

test.describe('Contact Form Modal', () => {
  test('should open the contact form modal when button is clicked', async ({
    page,
  }) => {
    await page.goto('/')

    const dialog = page.locator('#contactFormModal')
    await expect(dialog).not.toBeVisible()

    const openButton = page.getByRole('button', { name: 'Contact us' })
    await openButton.click()

    await expect(dialog).toBeVisible()

    await expect(dialog.getByPlaceholder('Name')).toBeVisible()
    await expect(dialog.getByPlaceholder('Email')).toBeVisible()
    await expect(dialog.getByPlaceholder('Message')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Send' })).toBeVisible()
  })

  test('should close the contact form modal when close button is clicked', async ({
    page,
  }) => {
    await page.goto('/')

    const dialog = page.locator('#contactFormModal')
    const openButton = page.getByRole('button', { name: 'Contact us' })
    await openButton.click()
    await expect(dialog).toBeVisible()

    const closeButton = dialog.getByRole('button', { name: 'Close modal' })
    await closeButton.click()

    await expect(dialog).not.toBeVisible()
  })

  test('should close the contact form modal when submit button is clicked', async ({
    page,
  }) => {
    await page.goto('/')

    const dialog = page.locator('#contactFormModal')
    const openButton = page.getByRole('button', { name: 'Contact us' })
    await openButton.click()
    await expect(dialog).toBeVisible()

    const submitButton = dialog.getByRole('button', { name: 'Send' })
    await submitButton.click()

    await expect(dialog).not.toBeVisible()
  })

  test('should not attach form inputs to URL on submit', async ({ page }) => {
    await page.goto('/')

    const dialog = page.locator('#contactFormModal')
    const openButton = page.getByRole('button', { name: 'Contact us' })
    await openButton.click()
    await expect(dialog).toBeVisible()

    await dialog.getByPlaceholder('Name').fill('John Doe')
    await dialog.getByPlaceholder('Email').fill('john@example.com')
    await dialog.getByPlaceholder('Message').fill('This is a test message')

    const submitButton = dialog.getByRole('button', { name: 'Send' })
    await submitButton.click()

    const currentUrl = page.url()
    expect(currentUrl).not.toContain('name=')
    expect(currentUrl).not.toContain('email=')
    expect(currentUrl).not.toContain('message=')
    expect(currentUrl).not.toContain('John')
    expect(currentUrl).not.toContain('john@example.com')
  })

  test('should change form translations when language switcher is clicked', async ({
    page,
  }) => {
    await page.goto('/en/')

    const dialog = page.locator('#contactFormModal')
    const openButtonEn = page.getByRole('button', { name: 'Contact us' })
    await openButtonEn.click()
    await expect(dialog).toBeVisible()

    await expect(dialog.getByPlaceholder('Name')).toBeVisible()
    await expect(dialog.getByPlaceholder('Email')).toBeVisible()
    await expect(dialog.getByPlaceholder('Message')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Send' })).toBeVisible()

    await dialog.getByRole('button', { name: 'Close modal' }).click()
    await expect(dialog).not.toBeVisible()

    const langSwitcher = page.locator('[data-lang-switcher]')
    langSwitcher.click()

    await page.waitForFunction(() => window.location.pathname.includes('/bg'))

    const openButtonBg = page.locator('[data-open-contact-form-modal]')
    await openButtonBg.click()
    await expect(dialog).toBeVisible()

    await expect(dialog.getByPlaceholder('Име', { exact: true })).toBeVisible()
    await expect(dialog.getByPlaceholder('Имейл')).toBeVisible()
    await expect(dialog.getByPlaceholder('Съобщение')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Изпрати' })).toBeVisible()
  })
})
