import { test, expect } from '@playwright/test'

test('Offline dictionary lookup saves two independent meanings and completes a review', async ({
  page,
  request
}) => {
  const lookup = await (
    await request.get('/api/dictionary/entries?q=evaluate')
  ).json()
  test.skip(
    !lookup.length,
    'Import the offline dictionary into the isolated test database.'
  )
  const candidate = lookup[0]
  const entry = await (
    await request.get(`/api/dictionary/entries/${candidate.id}`)
  ).json()
  const selected = entry.meanings.slice(0, 2)
  expect(selected.length).toBe(2)
  const external: string[] = []
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1') return route.continue()
    external.push(url.hostname)
    await route.abort()
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Thêm từ mới', exact: true }).click()
  const input = page.getByRole('combobox', { name: 'Tra từ tiếng Anh' })
  await input.fill('evaluate')
  await expect(
    page.getByRole('option', { name: /^evaluate/ }).first()
  ).toBeVisible()
  await input.press('ArrowDown')
  await input.press('Enter')
  const meanings = page.getByRole('group', { name: 'Chọn nghĩa muốn học' })
  const checkboxes = meanings.getByRole('checkbox')
  await expect(checkboxes).toHaveCount(2)
  for (const checkbox of await checkboxes.all())
    if (!(await checkbox.isChecked())) await checkbox.click()
  if (
    await page
      .getByRole('button', { name: 'Chỉnh sửa trước khi lưu' })
      .isEnabled()
  ) {
    await page.getByRole('button', { name: 'Chỉnh sửa trước khi lưu' }).click()
    await expect(page.getByLabel('Phiên âm IPA')).toHaveValue(candidate.ipa)
    await page.getByRole('button', { name: 'Lưu từ mới', exact: true }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  }
  const saved = (
    await (await request.get('/api/vocabularies?search=evaluate')).json()
  ).items.find((word: { term: string }) => word.term === candidate.term)
  expect(saved.meanings.length).toBeGreaterThanOrEqual(2)
  const [first, second] = saved.meanings
  const extraPractice = first.level > 0
  const created = await request.post('/api/practice-sessions', {
    data: { meaningIds: [first.id], audioEnabled: false, extraPractice }
  })
  expect(created.status()).toBe(201)
  const session = await created.json()
  await page.goto(`/practice?session=${session.id}&questions=1`)
  for (let i = 0; i < 5; i++) {
    const next = await request.get(
      `/api/practice-sessions/${session.id}/next-question`
    )
    if (next.status() === 204) break
    await page
      .getByRole('radio', { name: first.meaningVi, exact: true })
      .check()
    await page.getByRole('button', { name: 'Kiểm tra', exact: true }).click()
    await page.getByRole('button', { name: 'Tiếp tục', exact: true }).click()
    await expect(page.locator('.feedback-copy')).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'Hoàn thành phiên' }).click()
  await expect(
    page.getByRole('heading', { name: 'Đã hoàn thành phiên luyện tập' })
  ).toBeVisible()
  const updated = await (
    await request.get(`/api/vocabularies/${saved.id}`)
  ).json()
  expect(updated.meanings[0].level).toBe(extraPractice ? first.level : 1)
  expect(updated.meanings[1].level).toBe(second.level)
  await page.goto('/progress')
  await expect(
    page.getByRole('heading', { name: 'Tiến độ học tập' })
  ).toBeVisible()
  expect(external).toEqual([])
})
