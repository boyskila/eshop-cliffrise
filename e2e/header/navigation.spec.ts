import { test, expect, type Page } from '@playwright/test'

const VIEWPORTS = {
  phone: { width: 375, height: 667 },
  tabletPortrait: { width: 768, height: 1024 },
  tabletLandscape: { width: 900, height: 600 },
  desktop: { width: 1280, height: 800 },
} as const

const NAV_LABELS = [
  'Our Mission',
  'About Us',
  'Teteven Climb',
  'Products',
  'Contact us',
] as const

const NAV_ITEMS = [
  { name: 'Our Mission', href: '/en/#our-cause' },
  { name: 'About Us', href: '/en/#about-us' },
  { name: 'Teteven Climb', href: '/en/#events-section' },
  { name: 'Products', href: '/en/#products' },
  { name: 'Contact us', href: '/en/#contact-us' },
] as const

const SECTION_IDS = [
  'our-cause',
  'about-us',
  'events-section',
  'products',
  'contact-us',
] as const

const getMobileMenuButton = (page: Page) =>
  page.getByRole('button', { name: /open menu|close menu/i })

const getMobileMenu = (page: Page) =>
  page.getByRole('navigation', { name: /mobile navigation/i })

const openMobileMenu = async (page: Page) => {
  const mobileMenuButton = getMobileMenuButton(page)

  await expect(mobileMenuButton).toBeVisible()
  await expect(async () => {
    if ((await mobileMenuButton.getAttribute('aria-expanded')) !== 'true') {
      await mobileMenuButton.click()
    }
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true', {
      timeout: 500,
    })
  }).toPass({ timeout: 5000 })

  const menu = getMobileMenu(page)
  await expect(menu).toBeVisible()

  return { menu, mobileMenuButton }
}

const closeMobileMenu = async (page: Page) => {
  const mobileMenuButton = getMobileMenuButton(page)

  await expect(async () => {
    if ((await mobileMenuButton.getAttribute('aria-expanded')) !== 'false') {
      await mobileMenuButton.click()
    }
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false', {
      timeout: 500,
    })
  }).toPass({ timeout: 5000 })

  await expect(getMobileMenu(page)).toBeHidden()
}

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
    await expect(getMobileMenuButton(page)).toBeHidden()
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
    await expect(getMobileMenuButton(page)).toBeHidden()
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
    await expect(getMobileMenuButton(page)).toBeVisible()
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
    await expect(getMobileMenuButton(page)).toBeVisible()
  })
})

test.describe('Mobile menu button opens and closes the menu', () => {
  test('phone: clicking the mobile button toggles the menu', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.phone)
    await page.goto('/en/')

    await expect(getMobileMenu(page)).toBeHidden()

    await openMobileMenu(page)
    await closeMobileMenu(page)
  })

  test('tablet portrait: clicking the mobile button toggles the menu', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.tabletPortrait)
    await page.goto('/en/')

    await expect(getMobileMenu(page)).toBeHidden()

    await openMobileMenu(page)
    await closeMobileMenu(page)
  })

  test('phone: clicking outside closes the mobile menu', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.phone)
    await page.goto('/en/')

    const { mobileMenuButton } = await openMobileMenu(page)

    await page.mouse.click(20, VIEWPORTS.phone.height - 20)
    await expect(getMobileMenu(page)).toBeHidden()
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
  })

  test('tablet portrait: clicking outside closes the mobile menu', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.tabletPortrait)
    await page.goto('/en/')

    const { mobileMenuButton } = await openMobileMenu(page)

    await page.mouse.click(20, VIEWPORTS.tabletPortrait.height - 20)
    await expect(getMobileMenu(page)).toBeHidden()
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
  })

  test('phone: clicking inside the mobile menu keeps it open', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.phone)
    await page.goto('/en/')

    const { menu, mobileMenuButton } = await openMobileMenu(page)

    await menu.click({ position: { x: 8, y: 8 } })
    await expect(menu).toBeVisible()
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
  })

  test('phone: selecting a section from the mobile menu closes it', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.phone)
    await page.goto('/en/')

    const { menu, mobileMenuButton } = await openMobileMenu(page)
    await menu.getByRole('menuitem', { name: 'Products' }).click()

    await expect(page).toHaveURL(/\/en\/#products$/)
    await expect(menu).toBeHidden()
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
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

  test('desktop: visible nav links target existing page sections', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.goto('/en/')

    for (const { href } of NAV_ITEMS) {
      const hash = href.split('#').at(1)
      expect(hash).toBeTruthy()
      await expect(page.locator(`#${hash}`)).toHaveCount(1)
    }
  })

  test('shared section anchors exist on each locale homepage', async ({
    page,
  }) => {
    for (const locale of ['en', 'bg']) {
      await page.goto(`/${locale}/`)

      for (const id of SECTION_IDS) {
        await expect(page.locator(`#${id}`)).toHaveCount(1)
      }
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

  test('desktop: language switcher preserves current static page path', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.goto('/en/privacy-policy/')

    const langSwitcher = page.locator('[data-lang-switcher]')
    await expect(langSwitcher).toHaveAttribute('href', '/bg/privacy-policy/')

    await langSwitcher.click()

    await expect(page).toHaveURL(/\/bg\/privacy-policy\/$/)
  })

  test('desktop: language switcher preserves current product page path', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.goto('/en/products/1/')

    const langSwitcher = page.locator('[data-lang-switcher]')
    await expect(langSwitcher).toHaveAttribute('href', '/bg/products/1/')

    await langSwitcher.click()

    await expect(page).toHaveURL(/\/bg\/products\/1\/$/)
  })

  test('mobile menu: items match expected labels and destinations', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.phone)
    await page.goto('/en/')

    const { menu } = await openMobileMenu(page)

    for (const { name, href } of NAV_ITEMS) {
      const link = menu.getByRole('menuitem', { name, exact: true })
      await expect(link).toHaveAttribute('href', href)
    }
  })
})
