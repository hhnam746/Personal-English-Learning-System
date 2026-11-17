import { test, expect } from '@playwright/test'

test('Flashcard saves real reviews, survives API failure, locks pending actions and preserves SRS', async ({
  page,
  request
}) => {
  const cards = await (await request.get('/api/flashcards?pageSize=1')).json()
  const word = cards.items[0]
  const before = await (
    await request.get(`/api/learning-progress/${word.id}`)
  ).json()
  await page.goto('/flashcards')
  await expect(
    page.getByRole('button', { name: 'Lật thẻ xem nghĩa' })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Lật thẻ xem nghĩa' }).focus()
  await page.keyboard.press('Space')
  await expect(
    page.getByRole('button', { name: 'Đã nhớ', exact: true })
  ).toBeVisible()
  await page.route('**/reviews', (route) =>
    route.fulfill({ status: 503, json: { title: 'Review unavailable' } })
  )
  await page.getByRole('button', { name: 'Đã nhớ', exact: true }).click()
  await expect(page.getByText('Review unavailable')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Lật về mặt từ' })
  ).toBeVisible()
  await page.unroute('**/reviews')
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/reviews', async (route) => {
    await gate
    await route.continue()
  })
  await page.getByRole('button', { name: 'Đã nhớ', exact: true }).click()
  await expect(page.getByLabel('Lọc thẻ theo cấp độ')).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Thẻ tiếp theo' })
  ).toBeDisabled()
  release()
  await expect(page.getByLabel('Lọc thẻ theo cấp độ')).toBeEnabled()
  await expect(page.locator('.flash-top')).toContainText('02 /')
  const after = await (
    await request.get(`/api/learning-progress/${word.id}`)
  ).json()
  expect(after).toEqual(before)
  const history = await (
    await request.get(`/api/flashcards/reviews?vocabularyId=${word.id}`)
  ).json()
  expect(history.items[0].rating).toBe('remembered')
  await page.getByRole('button', { name: 'Kết thúc lượt ôn' }).click()
  await expect(
    page.getByRole('heading', { name: 'Đã kết thúc lượt ôn' })
  ).toBeVisible()
  await expect(page.locator('.result-metrics')).toContainText('1thẻ đã nhớ')
  await expect(page.getByText('thẻ chưa đánh giá')).toBeVisible()
  await page.getByRole('button', { name: 'Ôn lại bộ thẻ' }).click()
  await expect(page.locator('.flash-top')).toContainText('01 /')
  const filter = page.getByRole('combobox', { name: 'Lọc thẻ theo cấp độ' })
  await filter.focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('listbox')
  await expect(menu).toBeVisible()
  const selected = menu.getByRole('option', { name: 'Tất cả các từ' })
  await expect(selected).toHaveAttribute('data-state', 'checked')
  await expect(selected).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(menu.getByRole('option', { name: 'Chưa học' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/level=0/)
  await expect(filter).toHaveText('Chưa học')
  await expect(
    page.getByRole('button', { name: 'Lật thẻ xem nghĩa' })
  ).toBeVisible()
})

test('Progress matches real summary and daily API, period changes and links work', async ({
  page,
  request
}) => {
  const data = await (await request.get('/api/dashboard?days=14')).json()
  await page.goto('/progress')
  await expect(page.locator('.mastery-number > strong')).toHaveText(
    `${data.levels.find((l: { level: number }) => l.level === 5).count} / ${data.totalMeanings}`
  )
  await expect(page.locator('.progress-stats')).toContainText(
    `${data.correctAssessments} / ${data.assessmentAnswers}`
  )
  await expect(page.locator('.journey-row')).toHaveCount(5)
  await expect(
    page.getByRole('link', { name: `${data.newMeanings} nghĩa chưa học` })
  ).toHaveAttribute('href', '/library?filter=0')
  await page.getByText('Xem số liệu từng ngày').click()
  await expect(page.locator('.progress-daily tbody tr')).toHaveCount(14)
  await page.getByLabel('Khoảng thời gian hoạt động').click()
  await page
    .getByRole('option', { name: '30 ngày gần đây', exact: true })
    .click()
  await expect(page).toHaveURL(/days=30/)
  await expect(page.locator('.progress-daily tbody tr')).toHaveCount(30)
  await page.locator('.journey-row.level-2').click()
  await expect(page).toHaveURL(/library\?filter=2/)
})

test('Both pages handle empty/error data, long cards, responsive and themes', async ({
  page
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.route('**/api/flashcards?*', (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: 'test-word',
            term: 'extraordinarilylongvocabulary'.repeat(4),
            ipa: '/test/',
            level: 0,
            meanings: [
              {
                meaningVi: 'nghĩa dài '.repeat(80),
                partOfSpeech: 'noun',
                examples: [
                  {
                    sentenceEn: 'Example '.repeat(100),
                    sentenceVi: 'Ví dụ '.repeat(100)
                  }
                ]
              },
              { meaningVi: 'nghĩa thứ hai', examples: [] }
            ]
          }
        ],
        totalItems: 1,
        pageNumber: 1,
        pageSize: 1
      }
    })
  )
  for (const path of ['/flashcards', '/progress']) {
    await page.goto(path)
    await expect(
      page.getByRole('heading', {
        name: path === '/flashcards' ? 'Flashcard' : 'Tiến độ học tập',
        exact: true
      })
    ).toBeVisible()
    for (const theme of ['light', 'dark'])
      for (const width of [320, 375, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        await page.evaluate((theme) => {
          document.documentElement.dataset.theme = theme
        }, theme)
        if (path === '/flashcards') {
          const flip = page.locator('.flashcard')
          if ((await flip.getAttribute('aria-pressed')) !== 'true')
            await flip.click()
          await expect(page.locator('.flash-meanings')).toBeAttached()
        }
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth
            )
          )
          .toBe(true)
        if (width === 320 || width === 1440)
          await page.screenshot({
            path: `test-results/${path.slice(1)}-${theme}-${width}.png`,
            fullPage: true
          })
      }
  }
  await page.route('**/api/flashcards?*', (route) =>
    route.fulfill({
      json: { items: [], totalItems: 0, pageNumber: 1, pageSize: 1 }
    })
  )
  await page.goto('/flashcards')
  await expect(
    page.getByRole('heading', { name: 'Chưa có thẻ ở cấp độ này' })
  ).toBeVisible()
  await page.route('**/api/dashboard?*', (route) =>
    route.fulfill({ status: 503, json: { title: 'Summary unavailable' } })
  )
  await page.goto('/progress')
  await expect(page.getByText('Summary unavailable')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Thử lại' })).toBeVisible()
  expect(errors).toEqual([])
})

test('Single card ends, keyboard scroll works, and zero progress is not fabricated accuracy', async ({
  page
}) => {
  await page.route('**/api/flashcards?*', (route) =>
    route.fulfill({
      json: {
        items: [
          {
            id: 'one',
            term: 'one',
            level: 0,
            meanings: [
              {
                meaningVi: 'một',
                examples: [{ sentenceEn: 'example '.repeat(250) }]
              },
              { meaningVi: 'thứ hai', examples: [] }
            ]
          }
        ],
        totalItems: 1,
        pageNumber: 1,
        pageSize: 1
      }
    })
  )
  await page.route('**/api/flashcards/one/reviews', (route) =>
    route.fulfill({ status: 200, json: {} })
  )
  await page.goto('/flashcards')
  await page.getByRole('button', { name: 'Lật thẻ xem nghĩa' }).click()
  const card = page.getByRole('button', { name: 'Lật về mặt từ' })
  const content = card.locator('.flash-meanings')
  await expect(content).toContainText('thứ hai')
  await expect(page.locator('.flash-readable')).toHaveCount(0)
  await card.focus()
  await page.keyboard.press('End')
  await expect
    .poll(() => content.evaluate((e) => e.scrollTop))
    .toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Chưa nhớ', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Đã kết thúc lượt ôn' })
  ).toBeVisible()
  await expect(page.locator('.result-metrics')).toContainText('1thẻ chưa nhớ')
  const activity = [
    {
      date: '2026-11-12',
      assessmentAnswers: 0,
      correctAssessments: 0,
      reinforcementAnswers: 0,
      flashcardReviews: 0,
      completedSessions: 0
    }
  ]
  await page.route('**/api/dashboard?*', (route) =>
    route.fulfill({
      json: {
        totalWords: 0,
        totalMeanings: 0,
        learnedMeanings: 0,
        newMeanings: 0,
        availableNewMeanings: 0,
        dueMeanings: 0,
        masteredMeanings: 0,
        levels: [0, 1, 2, 3, 4, 5].map((level) => ({ level, count: 0 })),
        assessmentAnswers: 0,
        correctAssessments: 0,
        accuracyPercent: null,
        activity
      }
    })
  )
  await page.route('**/api/learning-progress?*', (route) =>
    route.fulfill({ status: 503, json: { title: 'Due unavailable' } })
  )
  await page.goto('/progress')
  await expect(page.locator('.progress-stats')).toContainText('—')
  await expect(page.getByText('Due unavailable')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Hành trình ghi nhớ' })
  ).toBeVisible()
  await expect(page.locator('.progress-period-stats')).toContainText('—')
})
