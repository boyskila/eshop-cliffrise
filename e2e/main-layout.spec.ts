import { test, expect } from '@playwright/test'

test('not throwig error when no hash is not present', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', ({ message }) => {
    errors.push(message)
  })
  await page.goto('/')

  expect(
    errors.includes(
      "Failed to execute 'querySelector' on 'Document': The provided selector is empty.",
    ),
  ).toBe(false)
})

test.skip('scrolls to element when lang is changed and hash is present on page reload', async ({
  page,
}) => {
  await page.goto('/en/#products')
  const langSwithcher = page.locator('[data-lang-switcher]')
  await langSwithcher.click()
  await page.reload()

  const el = page.locator('#products')
  await expect(el).toBeAttached()

  const inViewport = await page.evaluate(() => {
    const el = document.querySelector('#products')
    if (el) {
      const { top } = el.getBoundingClientRect()
      return Math.abs(top) < 5
    }
  })

  expect(inViewport).toBe(true)
})
