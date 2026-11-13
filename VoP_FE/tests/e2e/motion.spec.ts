import { test, expect } from '@playwright/test'

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`All pages respect ${reducedMotion}, themes and touch/desktop layouts`, async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion })
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    for (const route of [
      '/',
      '/library',
      '/practice',
      '/flashcards',
      '/progress',
      '/missing'
    ]) {
      await page.goto(route)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('.query-loading')).toHaveCount(0)
      const animation = await page
        .locator('.page-transition')
        .evaluate((el) => getComputedStyle(el).animationName)
      expect(animation).toBe(reducedMotion === 'reduce' ? 'none' : 'vop-fade')
      for (const theme of ['light', 'dark']) {
        // Exercise the real theme store, not just a CSS attribute.
        const toggle = page.getByRole('button', {
          name: 'Chuyển giao diện sáng hoặc tối'
        })
        await page.setViewportSize({ width: 1440, height: 1000 })
        if (
          (await toggle.getAttribute('aria-pressed')) !==
          String(theme === 'dark')
        )
          await toggle.click()
        for (const width of [320, 768, 1440]) {
          await page.setViewportSize({ width, height: 1000 })
          await page.evaluate(() => document.fonts.ready)
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth
            )
          ).toBe(true)
        }
      }
      await page.screenshot({
        path: `test-results/motion-${route.replace('/', '') || 'dashboard'}-${reducedMotion}.png`,
        fullPage: true
      })
    }
    expect(errors).toEqual([])
  })

  test(`Flashcard reverses safely and dialogs retain focus with ${reducedMotion}`, async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion })
    await page.goto('/flashcards')
    const card = page.locator('.flashcard')
    await expect(card).toBeVisible()
    await card.click()
    await expect(card).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.flash-back')).toHaveAttribute(
      'aria-hidden',
      'false'
    )
    if (reducedMotion === 'reduce') {
      expect(await card.evaluate((el) => getComputedStyle(el).transform)).toBe(
        'none'
      )
      await expect(page.locator('.flash-front')).toBeHidden()
    } else {
      await expect
        .poll(() => card.evaluate((el) => getComputedStyle(el).transform))
        .toBe('matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)')
      expect(
        await page
          .locator('.flash-back')
          .evaluate((el) => getComputedStyle(el).backfaceVisibility)
      ).toBe('hidden')
    }
    const bounds = await card.boundingBox()
    if (!bounds) throw new Error('Flashcard is outside the layout')
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2
    )
    const rotation = await card.evaluate((el) => getComputedStyle(el).transform)
    await page.mouse.down()
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).scale))
      .toBe(reducedMotion === 'reduce' ? 'none' : '0.99')
    expect(await card.evaluate((el) => getComputedStyle(el).transform)).toBe(
      rotation
    )
    await page.mouse.move(0, 0)
    await page.mouse.up()
    await card.focus()
    await page.keyboard.press('Space')
    await expect(card).toHaveAttribute('aria-pressed', 'false')
    const add = page
      .getByRole('button', { name: 'Thêm từ mới', exact: true })
      .first()
    await add.click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Từ / Cụm từ tiếng Anh').fill('unsaved-motion')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.getByRole('button', { name: 'Tiếp tục chỉnh sửa' }).click()
    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    await expect
      .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true)
    await expect(dialog.getByLabel('Từ / Cụm từ tiếng Anh')).toHaveValue(
      'unsaved-motion'
    )
    await dialog
      .getByRole('button', { name: 'Đóng hộp thoại', exact: true })
      .click()
    await page.getByRole('button', { name: 'Bỏ thay đổi', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(add).toBeFocused()
  })
}

test('Animated meters keep values and shape, daily disclosure works with reduced motion', async ({
  page,
  request
}) => {
  const data = await (await request.get('/api/dashboard?days=7')).json()
  await page.goto('/')
  const learned = page.getByRole('progressbar', {
    name: 'Tỷ lệ từ đã bắt đầu học'
  })
  await expect(learned).toHaveAttribute(
    'aria-valuenow',
    String(data.learnedWords)
  )
  await expect(learned).toHaveAttribute(
    'aria-valuemax',
    String(Math.max(data.totalWords, 1))
  )
  const indicator = learned.locator('[data-slot=progress-indicator]')
  expect(
    await indicator.evaluate((el) => getComputedStyle(el).backgroundImage)
  ).toContain('gradient')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/progress')
  const trigger = page.getByRole('button', { name: 'Xem số liệu từng ngày' })
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('.progress-daily tbody tr')).toHaveCount(14)
  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('Animation performance smoke records frame intervals without perpetual effects', async ({
  page
}, testInfo) => {
  await page.goto('/flashcards')
  const card = page.locator('.flashcard')
  await expect(card).toBeVisible()
  const sample = page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const frames: number[] = []
        let start = 0
        let last = 0
        const tick = (now: number) => {
          if (!start) start = now
          if (last) frames.push(now - last)
          last = now
          if (now - start < 700) requestAnimationFrame(tick)
          else resolve(frames)
        }
        requestAnimationFrame(tick)
      })
  )
  await card.click()
  const frames = (await sample).sort((a, b) => a - b)
  const metrics = {
    samples: frames.length,
    medianMs: frames[Math.floor(frames.length / 2)],
    p95Ms: frames[Math.floor(frames.length * 0.95)],
    over50ms: frames.filter((ms) => ms > 50).length
  }
  await testInfo.attach('frame-intervals-headless.json', {
    body: JSON.stringify(metrics),
    contentType: 'application/json'
  })
  expect(frames.length).toBeGreaterThan(0)
  await expect
    .poll(() =>
      card.evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === 'running').length
      )
    )
    .toBe(0)
})

test('Touch flip, audio setting and mobile navigation remain usable', async ({
  browser
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    baseURL: 'http://127.0.0.1:5175'
  })
  const page = await context.newPage()
  await page.goto('/flashcards')
  const card = page.locator('.flashcard')
  await card.tap()
  await expect(card).toHaveAttribute('aria-pressed', 'true')
  await card.tap()
  await expect(card).toHaveAttribute('aria-pressed', 'false')
  await page.screenshot({
    path: 'test-results/motion-flashcards-touch.png',
    fullPage: true
  })
  await page
    .getByRole('navigation', { name: 'Điều hướng di động' })
    .getByRole('link', { name: 'Luyện tập' })
    .tap()
  const audio = page.getByRole('checkbox', {
    name: 'Bật câu hỏi nghe khi từ có URL âm thanh'
  })
  await audio.tap()
  await expect(audio).toBeChecked()
  expect(
    await audio.evaluate((el) => getComputedStyle(el).borderTopWidth)
  ).toBe('1px')
  await page.screenshot({
    path: 'test-results/motion-practice-touch.png',
    fullPage: true
  })
  await context.close()
})
