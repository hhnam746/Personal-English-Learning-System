import { test, expect } from '@playwright/test'

test('Word forms use frosted glass and nested confirmations stay opaque in both themes', async ({
  page
}) => {
  for (const dark of [false, true]) {
    await page.goto('/')
    await page.setViewportSize({ width: 1440, height: 1000 })
    const theme = page.getByRole('button', {
      name: 'Chuyển giao diện sáng hoặc tối'
    })
    if ((await theme.getAttribute('aria-pressed')) !== String(dark))
      await theme.click()
    await page.getByRole('button', { name: 'Thêm từ mới', exact: true }).click()
    const form = page.getByRole('dialog')
    await expect(form).toHaveCSS('transform', 'none')
    await expect(form).toHaveCSS('filter', 'none')
    await expect(form).toHaveCSS('opacity', '1')
    await expect(form).toHaveCSS('background-image', /linear-gradient/)
    await expect(form).toHaveCSS('backdrop-filter', /blur\(18px\)/)
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      const close = form.locator('[data-slot="dialog-close"]')
      const bounds = await close.boundingBox()
      expect(bounds?.width).toBeGreaterThanOrEqual(44)
      expect(bounds?.height).toBeGreaterThanOrEqual(44)
      await page.screenshot({
        path: `test-results/apple-form-${dark ? 'dark' : 'light'}-${width}.png`,
        fullPage: true,
        animations: 'disabled'
      })
    }
    await form
      .getByLabel('Từ / Cụm từ tiếng Anh')
      .fill('Draft only — never saved')
    await page.keyboard.press('Escape')
    const confirm = page.getByRole('alertdialog')
    await expect(confirm).toHaveCSS(
      'background-color',
      dark ? 'rgb(45, 44, 47)' : 'rgb(250, 248, 246)'
    )
    await page.screenshot({
      path: `test-results/apple-confirm-${dark ? 'dark' : 'light'}.png`,
      animations: 'disabled'
    })
    await confirm.getByRole('button', { name: 'Tiếp tục chỉnh sửa' }).click()
    await expect(confirm).toHaveCount(0)
    await expect
      .poll(() => form.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true)
    await form
      .getByRole('button', { name: 'Đóng hộp thoại', exact: true })
      .click()
    await page.getByRole('button', { name: 'Bỏ thay đổi', exact: true }).click()
    await expect(form).toHaveCount(0)
  }
})

test('Reduced transparency and increased contrast replace glass with solid readable surfaces', async ({
  page
}) => {
  const session = await page.context().newCDPSession(page)
  for (const feature of ['prefers-reduced-transparency', 'prefers-contrast']) {
    const value = feature === 'prefers-contrast' ? 'more' : 'reduce'
    await session.send('Emulation.setEmulatedMedia', {
      features: [{ name: feature, value }]
    })
    await page.goto('/')
    expect(
      await page.evaluate(
        (query) => matchMedia(query).matches,
        `(${feature}: ${value})`
      )
    ).toBe(true)
    await expect(page.locator('.query-loading')).toHaveCount(0)
    await expect(page.locator('.sidebar')).toHaveCSS(
      'background-color',
      'rgb(250, 248, 246)'
    )
    await expect(page.locator('.sidebar')).toHaveCSS('backdrop-filter', 'none')
    await page.getByRole('button', { name: 'Thêm từ mới', exact: true }).click()
    await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCSS(
      'backdrop-filter',
      'none'
    )
    const form = page.getByRole('dialog')
    await expect(form).toHaveCSS('background-color', 'rgb(250, 248, 246)')
    await expect(form).toHaveCSS('backdrop-filter', 'none')
    if (feature === 'prefers-contrast')
      await expect(page.getByRole('dialog')).toHaveCSS(
        'border-top-color',
        'rgb(32, 32, 36)'
      )
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  }
})

test('Five pages support larger text and mobile touch target floors', async ({
  page
}) => {
  for (const route of [
    '/',
    '/library',
    '/practice',
    '/flashcards',
    '/progress'
  ]) {
    await page.goto(route)
    await page.setViewportSize({ width: 320, height: 1000 })
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    await expect(page.locator('.query-loading')).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    const theme = page.getByRole('button', {
      name: 'Đổi giao diện',
      exact: true
    })
    const bounds = await theme.boundingBox()
    expect(bounds?.width).toBeGreaterThanOrEqual(44)
    expect(bounds?.height).toBeGreaterThanOrEqual(44)
    await page.screenshot({
      path: `test-results/apple-large-text-${route.slice(1) || 'dashboard'}.png`,
      fullPage: true,
      animations: 'disabled'
    })
  }
})
