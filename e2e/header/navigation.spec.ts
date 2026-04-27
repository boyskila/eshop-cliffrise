import { test, expect } from '@playwright/test'

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

const NAV_ITEMS = [
  { name: 'Our Cause', href: '/en/#our-cause' },
  { name: 'About Us', href: '/en/#about-us' },
  { name: 'Teteven Climb', href: '/en/#events-section' },
  { name: 'Products', href: '/en/#products' },
  { name: 'Contact us', href: '/en/#contact-us' },
] as const

test.describe('Header navigation visibility across viewports', () => {
  test('desktop: nav links visible, mobile button hidden', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.goto('/en/')

    for (const name of NAV_LABELS) {
      const link = page
        .locator('header')
        .getByRole('link', { name, exact: true })
      await expect(link).toBeVisible()
    }
    const mobileMenuButton = page.getByRole('button', {
      name: /open menu|close menu/i,
    })
    await expect(mobileMenuButton).toBeHidden()
  })

  test('tablet landscape: nav links visible, mobile button hidden', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.tabletLandscape)
    await page.goto('/en/')

    for (const name of NAV_LABELS) {
      const link = page
        .locator('header')
        .getByRole('link', { name, exact: true })
      await expect(link).toBeVisible()
    }
    const mobileMenuButton = page.getByRole('button', {
      name: /open menu|close menu/i,
    })
    await expect(mobileMenuButton).toBeHidden()
  })

  test('tablet portrait: nav links hidden, mobile button visible', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.tabletPortrait)
    await page.goto('/en/')

    for (const name of NAV_LABELS) {
      const link = page
        .locator('header')
        .getByRole('link', { name, exact: true })
      await expect(link).toBeHidden()
    }
    const mobileMenuButton = page.getByRole('button', {
      name: /open menu|close menu/i,
    })
    await expect(mobileMenuButton).toBeVisible()
  })

  test('phone: nav links hidden, mobile button visible', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.phone)
    await page.goto('/en/')

    for (const name of NAV_LABELS) {
      const link = page
        .locator('header')
        .getByRole('link', { name, exact: true })
      await expect(link).toBeHidden()
    }
    const mobileMenuButton = page.getByRole('button', {
      name: /open menu|close menu/i,
    })
    await expect(mobileMenuButton).toBeVisible()
  })
})

test.describe('Mobile menu button opens and closes the menu', () => {
  test('phone: clicking the mobile button toggles the menu', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.phone)
    await page.goto('/en/')

    const mobileMenuButton = page.getByRole('button', {
      name: /open menu|close menu/i,
    })
    const menu = page.getByRole('navigation', { name: /mobile navigation/i })

    await expect(menu).toBeHidden()

    await mobileMenuButton.click()
    await expect(menu).toBeVisible()

    await mobileMenuButton.click()
    await expect(menu).toBeHidden()
  })

  test('tablet portrait: clicking the mobile button toggles the menu', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.tabletPortrait)
    await page.goto('/en/')

    const mobileMenuButton = page.getByRole('button', {
      name: /open menu|close menu/i,
    })
    const menu = page.getByRole('navigation', { name: /mobile navigation/i })

    await expect(menu).toBeHidden()

    await mobileMenuButton.click()
    await expect(menu).toBeVisible()

    await mobileMenuButton.click()
    await expect(menu).toBeHidden()
  })
})

test.describe('Header navigation destinations', () => {
  test('desktop: visible nav links point to the expected sections', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.goto('/en/')

    const header = page.locator('header')

    for (const { name, href } of NAV_ITEMS) {
      const link = header.getByRole('link', { name, exact: true })
      await expect(link).toHaveAttribute('href', href)
    }
  })

  test('desktop: clicking a hash link updates the language switcher target', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.goto('/en/')

    await page.locator('header').getByRole('link', { name: 'Products' }).click()

    await expect(page).toHaveURL(/\/en\/#products$/)
    await expect(page.locator('[data-lang-switcher]')).toHaveAttribute(
      'href',
      '/bg/#products',
    )
  })

  test('mobile menu: items match expected labels and destinations', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.phone)
    await page.goto('/en/')

    await page
      .getByRole('button', { name: /open menu|close menu/i })
      .click()

    const menu = page.getByRole('navigation', { name: /mobile navigation/i })
    await expect(menu).toBeVisible()

    for (const { name, href } of NAV_ITEMS) {
      const link = menu.getByRole('menuitem', { name, exact: true })
      await expect(link).toHaveAttribute('href', href)
    }
  })
})
