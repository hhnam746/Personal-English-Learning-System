import { test, expect } from '@playwright/test'

test.beforeEach(async ({ request }) => {
  const previous = await (await request.get('/api/practice-sessions?pageSize=100')).json()
  for (const session of previous.items)
    if (session.status === 'in_progress')
      await request.post(`/api/practice-sessions/${session.id}/abandon`)
})

test('Practice recovers stale pointer, preserves failed answer, resumes and abandons', async ({
  page,
  request
}) => {
  const created = await request.post('/api/vocabularies', {
    data: {
      term: `practice-${Date.now()}`,
      ipa: '/test/',
      meanings: [
        {
          meaningVi: 'bền bỉ',
          examples: [
            { sentenceEn: 'Keep going.', sentenceVi: 'Tiếp tục tiến lên.' }
          ]
        }
      ]
    }
  })
  expect(created.status()).toBe(201)
  const word = await created.json()
  await page.addInitScript(() =>
    localStorage.setItem(
      'vop-active-practice',
      JSON.stringify({ state: { sessionId: 'obsolete-id' }, version: 0 })
    )
  )
  await page.goto('/practice')
  await expect(
    page.getByRole('button', { name: 'Bắt đầu luyện tập', exact: true })
  ).toBeEnabled()
  const createdSession = await request.post('/api/practice-sessions', {
    data: { vocabularyIds: [word.id], audioEnabled: false }
  })
  expect(createdSession.status()).toBe(201)
  const session = await createdSession.json()
  await page.reload()
  await page.getByRole('link', { name: 'Tiếp tục phiên đang mở' }).click()
  await expect(page.getByText('Keep going.')).toBeVisible()
  await page.getByRole('button', { name: 'Bắt đầu câu hỏi' }).click()
  const question = await (
    await request.get(`/api/practice-sessions/${session.id}/next-question`)
  ).json()
  await page
    .getByRole('radio', { name: question.options[0], exact: true })
    .check()
  await page.route('**/answers', (route) =>
    route.fulfill({ status: 503, json: { title: 'Practice test unavailable' } })
  )
  await page.getByRole('button', { name: 'Kiểm tra', exact: true }).click()
  await expect(page.getByText('Practice test unavailable')).toBeVisible()
  await expect(
    page.getByRole('radio', { name: question.options[0], exact: true })
  ).toBeChecked()
  await page.unroute('**/answers')
  await page.getByRole('button', { name: 'Kiểm tra', exact: true }).click()
  const feedback = page.locator('.feedback-copy')
  const next = page.getByRole('button', { name: 'Tiếp tục', exact: true })
  await expect(feedback).toBeVisible()
  await expect(next).toBeFocused()
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/next-question', async (route) => {
    await gate
    await route.continue()
  })
  await next.click()
  await expect(next).toBeDisabled()
  await expect(feedback).toBeVisible()
  release()
  await expect(feedback).toHaveCount(0)
  await expect(page.locator('.question-form h2')).toBeFocused()
  await page.unroute('**/next-question')
  await page.reload()
  await expect(page.locator('.question-form')).toBeVisible()
  await page.getByRole('button', { name: 'Thoát phiên', exact: true }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page.getByRole('button', { name: 'Tiếp tục học', exact: true }).click()
  await expect(page.locator('.question-form')).toBeVisible()
  await page.getByRole('button', { name: 'Thoát phiên', exact: true }).click()
  await page
    .getByRole('button', { name: 'Xác nhận thoát', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Phiên đã kết thúc' })
  ).toBeVisible()
  expect(
    (await (await request.get(`/api/vocabularies/${word.id}`)).json()).level
  ).toBe(0)
  await page.getByRole('button', { name: 'Phiên mới', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Bắt đầu luyện tập', exact: true })
  ).toBeEnabled()
})

test('Practice setup and questions fit mobile/desktop in both themes', async ({
  page,
  request
}) => {
  await page.goto('/practice')
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const sessionResponse = await request.post('/api/practice-sessions', {
    data: { audioEnabled: false }
  })
  expect(sessionResponse.status()).toBe(201)
  const session = await sessionResponse.json()
  for (const stage of [
    '/practice',
    `/practice?session=${session.id}`,
    `/practice?session=${session.id}&questions=1`
  ]) {
    await page.goto(stage)
    for (const theme of ['light', 'dark']) {
      await page.evaluate(
        (t) => (document.documentElement.dataset.theme = t),
        theme
      )
      for (const width of [320, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        await expect(
          page.locator('.practice-setup,.new-word-intro,.question-form').first()
        ).toBeVisible()
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth
          )
        ).toBe(true)
      }
    }
    await page.screenshot({
      path: `test-results/practice-${stage.includes('questions') ? 'question' : stage.includes('session') ? 'intro' : 'setup'}.png`,
      fullPage: true
    })
  }
  expect(errors).toEqual([])
  expect(
    (
      await request.post(`/api/practice-sessions/${session.id}/abandon`)
    ).status()
  ).toBe(200)
})
