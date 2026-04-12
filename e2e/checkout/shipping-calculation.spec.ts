import { test, expect, type Page } from '@playwright/test'

const BOURGAS_OFFICE_ID = 115
const BOURGAS_OFFICE_NAME = 'БУРГАС - ИВАН БОГОРОВ'

const PRODUCT_URL = '/en/products/1/'

const selectOffice = (page: Page, officeId: number, officeName: string) =>
  page.evaluate(
    ({ officeId, officeName }) => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://services.speedy.bg',
          data: { id: officeId, name: officeName },
        }),
      )
    },
    { officeId, officeName },
  )

test.describe('Checkout - Shipping', () => {
  test('navigates from product page through cart to shipping form', async ({
    page,
  }) => {
    await page.goto(PRODUCT_URL)

    await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('_actions/addToCart') &&
          r.request().method() === 'POST',
      ),
      page.getByRole('button', { name: /add chunky chalk.*to cart/i }).click(),
    ])

    await page
      .locator('header')
      .getByRole('button', { name: /shopping cart/i })
      .click()

    const cartDialog = page.getByRole('dialog', { name: /shopping cart/i })
    await expect(cartDialog).toBeVisible()

    await cartDialog
      .getByRole('button', { name: /proceed to checkout/i })
      .click()

    await page.waitForURL('**/checkout/shipping/**')
    await expect(page.locator('#shipping-form')).toBeVisible()
  })

  test('calculates shipping fee after Bourgas office is selected', async ({
    page,
  }) => {
    const addRes = await page.request.post('/_actions/addToCart/', {
      data: { productId: '1', lang: 'en', quantity: 1 },
    })
    expect(addRes.ok()).toBeTruthy()

    await page.goto('/en/checkout/shipping/')
    await expect(page.locator('#shipping-form')).toBeVisible()

    await page.evaluate(
      ({ officeId, officeName }) => {
        window.dispatchEvent(
          new MessageEvent('message', {
            origin: 'https://services.speedy.bg',
            data: { id: officeId, name: officeName },
          }),
        )
      },
      { officeId: BOURGAS_OFFICE_ID, officeName: BOURGAS_OFFICE_NAME },
    )

    await expect(page.locator('#speedy-fee')).toContainText(/€\d+\.\d{2}/, {
      timeout: 15000,
    })
  })
})

test.describe('Checkout - Shipping form', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('/_actions/addToCart/', {
      data: { productId: '1', lang: 'en', quantity: 1 },
    })
    await page.goto('/en/checkout/shipping/')
    await expect(page.locator('#shipping-form')).toBeVisible()
  })

  test('shows validation error when submitting without selecting an office', async ({
    page,
  }) => {
    await page.locator('#shipping-submit').click()

    await expect(page.locator('#error-office')).toBeVisible()
  })

  test('office selection hides iframe and shows selected panel', async ({
    page,
  }) => {
    await expect(page.locator('#speedy-iframe-container')).toBeVisible()
    await expect(page.locator('#speedy-selected')).toBeHidden()

    await selectOffice(page, BOURGAS_OFFICE_ID, BOURGAS_OFFICE_NAME)

    await expect(page.locator('#speedy-iframe-container')).toBeHidden()
    await expect(page.locator('#speedy-selected')).toBeVisible()
    await expect(page.locator('#speedy-office-name')).toHaveText(
      BOURGAS_OFFICE_NAME,
    )
  })

  test('change office button resets selection and shows iframe again', async ({
    page,
  }) => {
    await selectOffice(page, BOURGAS_OFFICE_ID, BOURGAS_OFFICE_NAME)
    await expect(page.locator('#speedy-selected')).toBeVisible()

    await page.locator('#speedy-change').click()

    await expect(page.locator('#speedy-iframe-container')).toBeVisible()
    await expect(page.locator('#speedy-selected')).toBeHidden()
    await expect(page.locator('#speedy-office-name')).toHaveText('')
    await expect(page.locator('#speedy-fee')).toHaveText('')
  })

  test('selecting an office clears the office validation error', async ({
    page,
  }) => {
    await page.locator('#shipping-submit').click()
    await expect(page.locator('#error-office')).toBeVisible()

    await selectOffice(page, BOURGAS_OFFICE_ID, BOURGAS_OFFICE_NAME)

    await expect(page.locator('#error-office')).toBeHidden()
  })

  test('redirects to /checkout/ after selecting an office and submitting', async ({
    page,
  }) => {
    await selectOffice(page, BOURGAS_OFFICE_ID, BOURGAS_OFFICE_NAME)

    await page.locator('#shipping-submit').click()

    await page.waitForURL('**/checkout/**', { timeout: 15000 })
    expect(page.url()).toContain('/en/checkout/')
  })
})
