import { test, expect, type Page } from '@playwright/test'

const VIEWPORTS = {
  phone: { width: 375, height: 667 },
  tabletPortrait: { width: 768, height: 1024 },
  tabletLandscape: { width: 900, height: 600 },
  desktop: { width: 1280, height: 800 },
} as const

const NAV_LABELS = [
  'Our Cause',
  'About Us',
  'Teteven Climb',
  'Products',
  'Contact us',
] as const

const desktopNavLink = (page: Page, name: string) =>
  page.locator('header').getByRole('link', { name, exact: true })

const mobileMenuButton = (page: Page) =>
  page.getByRole('button', { name: /open menu|close menu/i })

const mobileMenuPanel = (page: Page) =>
  page.getByRole('navigation', { name: /mobile navigation/i })

test.describe('Header navigation visibility across viewports', () => {
  test('desktop: nav links visible, mobile button hidden', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.goto('/en/')

    for (const name of NAV_LABELS) {
      await expect(desktopNavLink(page, name)).toBeVisible()
    }
    await expect(mobileMenuButton(page)).toBeHidden()
  })

  test('tablet landscape: nav links visible, mobile button hidden', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.tabletLandscape)
    await page.goto('/en/')

    for (const name of NAV_LABELS) {
      await expect(desktopNavLink(page, name)).toBeVisible()
    }
    await expect(mobileMenuButton(page)).toBeHidden()
  })

  test('tablet portrait: nav links hidden, mobile button visible', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.tabletPortrait)
    await page.goto('/en/')

    for (const name of NAV_LABELS) {
      await expect(desktopNavLink(page, name)).toBeHidden()
    }
    await expect(mobileMenuButton(page)).toBeVisible()
  })

  test('phone: nav links hidden, mobile button visible', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.phone)
    await page.goto('/en/')

    for (const name of NAV_LABELS) {
      await expect(desktopNavLink(page, name)).toBeHidden()
    }
    await expect(mobileMenuButton(page)).toBeVisible()
  })
})

test.describe('Mobile menu button opens and closes the menu', () => {
  test('phone: clicking the mobile button toggles the menu', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.phone)
    await page.goto('/en/')

    const button = mobileMenuButton(page)
    const menu = mobileMenuPanel(page)

    await expect(menu).toBeHidden()

    await button.click()
    await expect(menu).toBeVisible()

    await button.click()
    await expect(menu).toBeHidden()
  })

  test('tablet portrait: clicking the mobile button toggles the menu', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.tabletPortrait)
    await page.goto('/en/')

    const button = mobileMenuButton(page)
    const menu = mobileMenuPanel(page)

    await expect(menu).toBeHidden()

    await button.click()
    await expect(menu).toBeVisible()

    await button.click()
    await expect(menu).toBeHidden()
  })
})
