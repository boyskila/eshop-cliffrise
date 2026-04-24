import { test, expect, type Page } from '@playwright/test'

const getPanel = (page: Page, year: '2025' | '2026') =>
  page.locator(`.overflow-x-hidden > [data-year-panel="${year}"]`)

test.describe('Events Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays title image and description text', async ({ page }) => {
    const title = page.locator('#events-section')
    await expect(title).toBeVisible()

    const description = title.locator('..').locator('..').locator('p')
    await expect(description).toContainText('Teteven Climb')
    await expect(description).toContainText(
      'how strong and vibrant the climbing community is',
    )
  })

  test('2026 panel is visible by default', async ({ page }) => {
    const panel2026 = getPanel(page, '2026')
    await expect(panel2026).toBeVisible()

    const poster = panel2026.locator('img')
    await expect(poster).toBeVisible()
    await expect(poster).toHaveAttribute('src', /ttvn_meetup_2026/)
  })

  test('2025 panel is hidden by default', async ({ page }) => {
    const panel2025 = getPanel(page, '2025')
    await expect(panel2025).toBeHidden()
  })

  test('"See the event" link points to the Facebook event', async ({
    page,
  }) => {
    const link = page.locator('a[href="https://fb.me/e/7ebntwiFq"]')
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveText(/see the event/i)
  })
})

test.describe('Year Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('2026 button is pressed by default, 2025 is not', async ({ page }) => {
    const btn2026 = page.locator('[data-year-toggle="2026"]')
    const btn2025 = page.locator('[data-year-toggle="2025"]')

    await expect(btn2026).toHaveAttribute('aria-pressed', 'true')
    await expect(btn2025).toHaveAttribute('aria-pressed', 'false')
  })

  test('clicking 2025 shows 2025 panel and hides 2026 panel', async ({
    page,
  }) => {
    const btn2025 = page.locator('[data-year-toggle="2025"]')
    const panel2026 = getPanel(page, '2026')
    const panel2025 = getPanel(page, '2025')

    await expect(panel2025).toBeHidden()
    await expect(panel2026).toBeVisible()

    await btn2025.click()

    await expect(panel2025).toBeVisible()
    await expect(panel2026).toBeHidden()
  })

  test('clicking 2025 updates aria-pressed on both buttons', async ({
    page,
  }) => {
    const btn2026 = page.locator('[data-year-toggle="2026"]')
    const btn2025 = page.locator('[data-year-toggle="2025"]')

    await expect(btn2025).toHaveAttribute('aria-pressed', 'false')
    await expect(btn2026).toHaveAttribute('aria-pressed', 'true')

    await btn2025.click()

    await expect(btn2025).toHaveAttribute('aria-pressed', 'true')
    await expect(btn2026).toHaveAttribute('aria-pressed', 'false')
  })

  test('switching back to 2026 restores original state', async ({ page }) => {
    const btn2026 = page.locator('[data-year-toggle="2026"]')
    const btn2025 = page.locator('[data-year-toggle="2025"]')
    const panel2026 = getPanel(page, '2026')
    const panel2025 = getPanel(page, '2025')

    await btn2025.click()
    await expect(panel2025).toBeVisible()

    await btn2026.click()

    await expect(panel2026).toBeVisible()
    await expect(panel2025).toBeHidden()
    await expect(btn2026).toHaveAttribute('aria-pressed', 'true')
    await expect(btn2025).toHaveAttribute('aria-pressed', 'false')
  })

  test('clicking the already active year does nothing', async ({ page }) => {
    const btn2026 = page.locator('[data-year-toggle="2026"]')
    const panel2026 = getPanel(page, '2026')
    const panel2025 = getPanel(page, '2025')

    await btn2026.click()

    await expect(panel2026).toBeVisible()
    await expect(panel2025).toBeHidden()
    await expect(btn2026).toHaveAttribute('aria-pressed', 'true')
  })
})
