import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })
  test('cart button is visible and has expected accessibility attributes', async ({
    page,
  }) => {
    const cartBtn = page
      .locator('header')
      .getByRole('button', { name: /shopping cart with 0 items/i })
    await expect(cartBtn).toBeVisible()
    await expect(cartBtn).toHaveAttribute('aria-expanded', 'false')

    const cartDrawer = page.getByRole('dialog', {
      name: /shopping cart/i,
    })
    await expect(cartDrawer).toBeHidden()
  })

  test('clicking the cart button opens the cart panel and sets aria-expanded', async ({
    page,
  }) => {
    const cartBtn = page
      .locator('header')
      .getByRole('button', { name: /shopping cart/i })
    const cartDrawer = page.getByRole('dialog', { name: /shopping cart/i })

    await cartBtn.click()
    await expect(cartDrawer).toBeVisible()
    await expect(cartBtn).toHaveAttribute('aria-expanded', 'true')
  })

  test('cart panel can be closed via clicking on the backdrop and aria-expanded is reset', async ({
    page,
  }) => {
    const cartBtn = page
      .locator('header')
      .getByRole('button', { name: /shopping cart with 0 items/i })
    const cartDrawer = page.getByRole('dialog', { name: /shopping cart/i })
    const backdrop = page.getByLabel(/close shopping cart/i).first()

    await cartBtn.click()
    await expect(backdrop).toBeVisible()

    await backdrop.click()
    await expect(cartDrawer).toBeHidden()
    await expect(cartBtn).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('Functionallity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })
  test('cart button updates cart count when items are added to cart', async ({
    page,
  }) => {
    const addButtons = page.getByRole('button', { name: /Add .* to cart/ })

    const badge = page
      .getByLabel('Shopping cart with 0 items')
      .locator('span')
      .filter({ hasText: /^[1-9]\d*$/ })
    await expect(badge).toHaveCount(0)

    await addButtons.nth(0).click()
    const cartAfterFirstAdd = page.getByLabel('Shopping cart with 1 item')
    expect(cartAfterFirstAdd).toBeDefined()
    expect(cartAfterFirstAdd.locator('span', { hasText: '1' })).toBeDefined()

    await addButtons.nth(1).click()
    const cartAfterSecondAdd = page.getByLabel('Shopping cart with 2 items')
    expect(cartAfterSecondAdd).toBeDefined()
    expect(cartAfterSecondAdd.locator('span', { hasText: '2' })).toBeDefined()

    await addButtons.nth(2).click()
    const cartAfterThirdAdd = page.getByLabel('Shopping cart with 3 items')
    expect(cartAfterThirdAdd).toBeDefined()
    expect(cartAfterThirdAdd.locator('span', { hasText: '3' })).toBeDefined()
  })

  test('cart button updates cart count when items are removed from the cart', async ({
    page,
  }) => {
    const header = page.locator('header')
    const addButtons = page.getByRole('button', { name: /Add .* to cart/ })

    await addButtons.nth(0).click()
    await addButtons.nth(1).click()
    await addButtons.nth(2).click()
    const cartBtn = header.getByLabel(/3 items/i)

    await cartBtn.click()

    const removeButtons = page
      .getByRole('dialog', { name: /shopping cart/i })
      .getByRole('button', { name: /remove/i })

    await removeButtons.nth(2).click()
    expect(header.getByLabel(/2 items/i)).toBeDefined()

    await removeButtons.nth(1).click()
    expect(header.getByLabel(/1 item/i)).toBeDefined()

    await removeButtons.nth(0).click()
    const cartBtnAfterRemovals = header.getByLabel(/0 items/i)

    const badge = cartBtnAfterRemovals
      .locator('span')
      .filter({ hasText: /^[1-9]\d*$/ })
    await expect(badge).toHaveCount(0)
  })

  test('cart button updates cart count when increased/decreased items from the cart', async ({
    page,
  }) => {
    const header = page.locator('header')
    const addButtons = page.getByRole('button', { name: /Add .* to cart/ })

    await addButtons.nth(0).click()
    await header.getByLabel(/1 item/).click()
    const shoppingCartDialog = page.getByRole('dialog', {
      name: /shopping cart/i,
    })
    const increaseButton = shoppingCartDialog.getByRole('button', {
      name: /increase/i,
    })
    const decreaseButton = shoppingCartDialog.getByRole('button', {
      name: /decrease/i,
    })

    await increaseButton.click()
    expect(header.getByLabel(/2 items/i)).toBeDefined()

    await decreaseButton.click()
    expect(header.getByLabel(/1 item/i)).toBeDefined()

    await decreaseButton.click()
    expect(header.getByLabel(/0 items/i)).toBeDefined()

    const badge = header
      .getByLabel(/0 items/i)
      .locator('span', { hasText: '0' })
    await expect(badge).toHaveCount(0)
  })
})
