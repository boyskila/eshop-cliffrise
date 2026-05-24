import { expect, test } from '@playwright/test'

test.describe('About section profile links', () => {
  test('founder names link to dedicated pages', async ({ page }) => {
    await page.goto('/en/#about-us')

    const aboutSection = page.locator('#about-us')
    await expect(
      aboutSection.getByRole('link', { name: 'Boyko Lalov' }),
    ).toHaveAttribute('href', '/en/people/boyko-lalov/')
    await expect(
      aboutSection.getByRole('link', { name: 'Alex Ianev' }),
    ).toHaveAttribute('href', '/en/people/alex-ianev/')
  })

  test('clicking a founder name opens the dedicated profile page', async ({
    page,
  }) => {
    await page.goto('/en/#about-us')

    await page
      .locator('#about-us')
      .getByRole('link', { name: 'Boyko Lalov' })
      .click()

    await expect(page).toHaveURL(/\/en\/people\/boyko-lalov\/$/)
    await expect(
      page.getByRole('heading', { name: 'Boyko Lalov' }),
    ).toBeVisible()
  })
})
