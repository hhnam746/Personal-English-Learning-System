import { test, expect } from '@playwright/test'
const prefix = 'browser-' + Date.now()
test('Dashboard live data, filters, period and persisted theme', async ({
  page,
  request
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  const data = await (await request.get('/api/dashboard?days=7')).json()
  await page.goto('/')
  await expect(page.locator('.vocab-total strong')).toHaveText(
    String(data.totalWords)
  )
  await page.locator('.memory-column.level-1').click()
  await expect(page).toHaveURL(/filter=1/)
  await expect(
    page.getByRole('heading', { name: 'Kho từ vựng', exact: true })
  ).toBeVisible()
  await page.goBack()
  await page.getByLabel('Khoảng thời gian hoạt động').selectOption('14')
  await expect(page.locator('.line-chart circle')).toHaveCount(14)
  await page
    .getByRole('button', { name: 'Chuyển giao diện sáng hoặc tối' })
    .click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page
    .getByRole('button', { name: 'Chuyển giao diện sáng hoặc tối' })
    .click()
  expect(errors).toEqual([])
})
test('Create, search, detail, edit multiple meanings, reject duplicate and delete', async ({
  page
}) => {
  await page.goto('/library')
  await page
    .getByRole('button', { name: 'Thêm từ mới', exact: true })
    .first()
    .click()
  const modal = page.getByRole('dialog')
  await modal.getByRole('button', { name: 'Lưu từ', exact: true }).click()
  await expect(modal.getByText('Nhập từ tiếng Anh')).toBeVisible()
  await modal.getByLabel('Từ / cụm từ tiếng Anh').fill(prefix)
  await modal
    .getByLabel('Nghĩa tiếng Việt', { exact: true })
    .fill('bền bỉ trong thử thách')
  await modal.getByRole('button', { name: 'Thêm ví dụ', exact: true }).click()
  await modal
    .getByLabel('Câu ví dụ tiếng Anh', { exact: true })
    .fill('Remain resilient.')
  await modal.getByRole('button', { name: 'Thêm nghĩa', exact: true }).click()
  await modal
    .getByLabel('Nghĩa tiếng Việt', { exact: true })
    .nth(1)
    .fill('có khả năng phục hồi')
  await modal.getByRole('button', { name: 'Lưu từ', exact: true }).click()
  await expect(modal).toHaveCount(0)
  await page.getByLabel('Tìm từ hoặc nghĩa tiếng Việt').fill(prefix)
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page.getByRole('button', { name: prefix, exact: false }).first().click()
  await expect(
    modal.getByRole('heading', { name: 'có khả năng phục hồi' })
  ).toBeVisible()
  await modal.getByRole('button', { name: 'Sửa từ', exact: true }).click()
  await modal.getByLabel('Phiên âm IPA', { exact: true }).fill('/test/')
  await modal.getByRole('button', { name: 'Lưu từ', exact: true }).click()
  await expect(modal).toHaveCount(0)
  await page.getByRole('button', { name: prefix, exact: false }).first().click()
  await expect(modal.getByText('Remain resilient.')).toBeVisible()
  await expect(
    modal.getByRole('heading', { name: 'có khả năng phục hồi' })
  ).toBeVisible()
  await modal.getByRole('button', { name: 'Close', exact: true }).click()
  await page
    .getByRole('button', { name: 'Thêm từ mới', exact: true })
    .first()
    .click()
  await modal.getByLabel('Từ / cụm từ tiếng Anh').fill(prefix)
  await modal.getByLabel('Nghĩa tiếng Việt', { exact: true }).fill('trùng')
  await modal.getByRole('button', { name: 'Lưu từ', exact: true }).click()
  await expect(modal.getByLabel('Từ / cụm từ tiếng Anh')).toHaveValue(prefix)
  await expect(
    page.getByText('Term already exists (including archived vocabulary).')
  ).toBeVisible()
  page.once('dialog', (d) => d.accept())
  await modal.getByRole('button', { name: 'Hủy', exact: true }).click()
  await page.getByRole('button', { name: prefix, exact: false }).first().click()
  await modal.getByRole('button', { name: 'Xóa từ', exact: true }).click()
  await page.getByRole('button', { name: 'Xác nhận xóa', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('tbody tr')).toHaveCount(0)
})
test('Failed save keeps draft and Back protects unsaved edits', async ({
  page
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Thêm từ mới', exact: true }).click()
  const modal = page.getByRole('dialog')
  await modal.getByLabel('Từ / cụm từ tiếng Anh').fill(prefix + '-failure')
  await modal
    .getByLabel('Nghĩa tiếng Việt', { exact: true })
    .fill('giữ bản nháp')
  await page.route('**/api/vocabularies', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 500, json: { title: 'Test failure' } })
      : route.continue()
  )
  await modal.getByRole('button', { name: 'Lưu từ', exact: true }).click()
  await expect(page.getByText('Test failure')).toBeVisible()
  await expect(modal.getByLabel('Từ / cụm từ tiếng Anh')).toHaveValue(
    prefix + '-failure'
  )
  page.once('dialog', (d) => d.dismiss())
  await page.goBack()
  await expect(modal).toBeVisible()
  await expect(modal.getByLabel('Từ / cụm từ tiếng Anh')).toHaveValue(
    prefix + '-failure'
  )
})
test('Loading/error/retry states never replace errors with fake totals', async ({
  page
}) => {
  await page.route('**/api/dashboard?*', (r) =>
    r.fulfill({ status: 503, json: { title: 'API unavailable' } })
  )
  await page.goto('/')
  await expect(
    page.getByRole('alert').filter({ hasText: 'API unavailable' })
  ).toBeVisible()
  await expect(page.locator('.vocab-total')).toHaveCount(0)
  await page.unroute('**/api/dashboard?*')
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click()
  await expect(page.locator('.vocab-total')).toBeVisible()
})
test('Dashboard and library have no viewport overflow in both themes', async ({
  page
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 })
    for (const path of ['/', '/library']) {
      await page.goto(path)
      await page
        .locator('.vocab-total, .table-container, .empty-state')
        .first()
        .waitFor()
      for (const dark of [false, true]) {
        await page.evaluate((d) => {
          document.documentElement.dataset.theme = d ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', d)
        }, dark)
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth
          ),
          `${path} width${width} dark${dark}`
        ).toBe(true)
        if (width === 1440 || width === 390)
          await page.screenshot({
            path: `/tmp/vop-${path === '/' ? 'dashboard' : 'library'}-${width}-${dark ? 'dark' : 'light'}.png`,
            fullPage: true
          })
      }
    }
  }
})

test('Dashboard start, resume after navigation and complete a real practice session', async ({
  page,
  request
}) => {
  const previous = await (
    await request.get('/api/practice-sessions?pageSize=100')
  ).json()
  for (const session of previous.items)
    if (session.status === 'in_progress')
      await request.post(`/api/practice-sessions/${session.id}/abandon`)
  const words = await (
    await request.get('/api/vocabularies?pageSize=100')
  ).json()
  const meanings = new Map<string, string>(
    words.items.map(
      (w: { term: string; meanings: { meaningVi: string }[] }) => [
        w.term,
        w.meanings[0].meaningVi
      ]
    )
  )
  await page.goto('/')
  await page
    .getByRole('link', { name: 'Bắt đầu luyện tập', exact: false })
    .click()
  await page
    .getByRole('button', { name: 'Bắt đầu luyện tập', exact: true })
    .click()
  await expect(page).toHaveURL(/session=/)
  const sessionId = new URL(page.url()).searchParams.get('session')!
  const session = await (
    await request.get(`/api/practice-sessions/${sessionId}`)
  ).json()
  await page
    .getByRole('link', { name: 'Tổng quan', exact: true })
    .first()
    .click()
  await page
    .getByRole('link', { name: 'Bắt đầu luyện tập', exact: false })
    .click()
  await page.getByRole('link', { name: 'Tiếp tục phiên đang mở' }).click()
  await expect(page).toHaveURL(new RegExp(sessionId))
  await page.getByRole('button', { name: 'Bắt đầu câu hỏi' }).click()
  for (let i = 0; i < 50; i++) {
    await page.locator('.question-form,.result-page').first().waitFor()
    if (
      await page
        .getByRole('button', { name: 'Hoàn thành phiên', exact: true })
        .isVisible()
    )
      break
    const questionResponse = await request.get(
      `/api/practice-sessions/${sessionId}/next-question`
    )
    expect(questionResponse.status()).toBe(200)
    const q = await questionResponse.json()
    if (q.type === 'meaning_mcq') {
      const correct = meanings.get(q.prompt)
      const choice =
        i === 0 ? q.options.find((o: string) => o !== correct) : correct
      await page.getByRole('radio', { name: choice, exact: true }).check()
    } else {
      const sessionWord = session.words.find(
        (w: { id: string }) => w.id === q.sessionWordId
      )
      const word = words.items.find(
        (w: { id: string }) => w.id === sessionWord.vocabularyId
      )
      const example = word.meanings
        .flatMap(
          (m: {
            examples: { clozeSentenceEn: string; clozeAnswer: string }[]
          }) => m.examples
        )
        .find(
          (e: { clozeSentenceEn: string }) => e.clozeSentenceEn === q.prompt
        )
      await page
        .getByLabel('Câu trả lời', { exact: true })
        .fill(example.clozeAnswer)
    }
    await page.getByRole('button', { name: 'Kiểm tra', exact: true }).click()
    await expect(
      page.getByRole('heading', {
        name: i === 0 ? 'Chưa đúng' : 'Chính xác!',
        exact: true
      })
    ).toBeVisible()
    if (i === 0) {
      await page.route('**/next-question', async (r) => {
        await new Promise((resolve) => setTimeout(resolve, 400))
        await r.continue()
      })
      await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click()
      await expect(
        page.getByRole('button', { name: 'Kiểm tra', exact: true })
      ).toHaveCount(0)
      await page.unroute('**/next-question')
    } else
      await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click()
  }
  await page
    .getByRole('button', { name: 'Hoàn thành phiên', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Đã hoàn thành phiên luyện tập' })
  ).toBeVisible()
  const completed = await (
    await request.get(`/api/practice-sessions/${sessionId}`)
  ).json()
  expect(completed.status).toBe('completed')
  await page.getByRole('link', { name: 'Về tổng quan', exact: true }).click()
  await expect(page.locator('.vocab-total')).toBeVisible()
})

test('Library combines server search/filter/sort and paginates without dropping records', async ({
  page,
  request
}) => {
  const termPrefix = prefix + '-pages'
  for (let i = 0; i < 22; i++) {
    const response = await request.post('/api/vocabularies', {
      data: {
        term: termPrefix + String(i).padStart(2, '0'),
        meanings: [{ meaningVi: 'từ kiểm tra phân trang', examples: [] }]
      }
    })
    expect(response.status()).toBe(201)
  }
  await page.goto('/library')
  await page.getByLabel('Tìm từ hoặc nghĩa tiếng Việt').fill(termPrefix)
  await page.getByLabel('Sắp xếp từ').selectOption('alpha')
  await page.getByRole('button', { name: 'Chưa học', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(20)
  await expect(page.locator('tbody tr').first()).toContainText(
    termPrefix + '00'
  )
  await page.getByRole('button', { name: 'Sau', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await expect(page.locator('tbody tr').first()).toContainText(
    termPrefix + '20'
  )
  await page.getByRole('button', { name: 'Level 5', exact: true }).click()
  await expect(page.getByText('Không có từ phù hợp.')).toBeVisible()
  await page.getByRole('button', { name: 'Tất cả', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(20)
  await page
    .getByRole('searchbox', { name: 'Tìm trong kho từ', exact: true })
    .fill(termPrefix + '21')
  await page
    .getByRole('searchbox', { name: 'Tìm trong kho từ', exact: true })
    .press('Enter')
  await expect(page.locator('tbody tr')).toHaveCount(1)
})

test('Mobile form remains usable and delete is available from each library row', async ({
  page,
  request
}) => {
  const term = prefix + '-row-delete'
  expect(
    (
      await request.post('/api/vocabularies', {
        data: { term, meanings: [{ meaningVi: 'xóa từ hàng', examples: [] }] }
      })
    ).status()
  ).toBe(201)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/library?search=' + term)
  await page.getByRole('button', { name: `Xóa ${term}`, exact: true }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page.getByRole('button', { name: 'Xác nhận xóa', exact: true }).click()
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Thêm từ mới', exact: true })
    .first()
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(
    await page
      .getByRole('dialog')
      .evaluate(
        (e) =>
          e.getBoundingClientRect().width <= innerWidth &&
          e.getBoundingClientRect().height <= innerHeight
      )
  ).toBe(true)
  expect(
    await page
      .locator('.mobile-nav svg')
      .first()
      .evaluate((e) => parseFloat(getComputedStyle(e).strokeWidth))
  ).toBeLessThan(3)
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Hủy', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
