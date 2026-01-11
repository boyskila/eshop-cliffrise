import { test, expect } from '@playwright/test'

test('has "Home" title', async ({ page }) => {
  await page.goto('http://localhost:4321')
  await expect(page).toHaveTitle(/Cliffrise eshop | Home/)
})
