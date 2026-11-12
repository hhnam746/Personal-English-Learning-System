import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activityGeometry } from '../../src/features/dashboard/chart-geometry.ts'
import { vocabularySchema } from '../../src/features/vocabularies/validations.ts'
const day = (assessmentAnswers: number) => ({
  date: '2026-11-11',
  assessmentAnswers,
  correctAssessments: 0,
  reinforcementAnswers: 0,
  flashcardReviews: 0,
  completedSessions: 0
})
test('chart handles empty and zero-filled data without invalid coordinates', () => {
  for (const days of [[], [day(0)], [day(0), day(0)]]) {
    const g = activityGeometry(days, 320, 200)
    assert.ok(!/NaN|Infinity/.test(g.line))
    assert.equal(g.max, 4)
  }
})
test('chart follows each actual point and preserves monotonic intervals', () => {
  const g = activityGeometry([day(0), day(8), day(2), day(4)], 600, 240)
  assert.equal(g.max, 8)
  assert.equal(g.points[1].y, g.top)
  assert.equal(g.points[0].y, g.bottom)
  assert.ok(g.ticks.includes(3))
  for (const point of g.points)
    assert.ok(point.y >= g.top && point.y <= g.bottom)
})
test('narrow fourteen-day charts thin labels, never observations', () => {
  const g = activityGeometry(
    Array.from({ length: 14 }, () => day(3)),
    250,
    200
  )
  assert.equal(g.points.length, 14)
  assert.ok(g.ticks.length < 14)
  assert.equal(g.ticks.at(-1), 13)
})
const form = {
  term: 'resilient',
  ipa: '',
  audioUrl: '',
  meanings: [
    { meaningVi: 'kiên cường', partOfSpeech: '', ipaOverride: '', examples: [] }
  ]
}
test('vocabulary form rejects blank meanings, non-http audio and incomplete cloze', () => {
  assert.equal(
    vocabularySchema.safeParse({ ...form, term: '  ' }).success,
    false
  )
  assert.equal(
    vocabularySchema.safeParse({ ...form, audioUrl: 'javascript:alert(1)' })
      .success,
    false
  )
  assert.equal(
    vocabularySchema.safeParse({
      ...form,
      meanings: [{ ...form.meanings[0], meaningVi: ' ' }]
    }).success,
    false
  )
  assert.equal(
    vocabularySchema.safeParse({
      ...form,
      meanings: [
        {
          ...form.meanings[0],
          examples: [
            {
              sentenceEn: 'Be resilient',
              sentenceVi: '',
              clozeSentenceEn: 'Be resilient',
              clozeAnswer: 'resilient'
            }
          ]
        }
      ]
    }).success,
    false
  )
})
test('multiple meanings retain existing IDs and explicit valid cloze', () => {
  const result = vocabularySchema.parse({
    ...form,
    meanings: [
      {
        ...form.meanings[0],
        id: 'meaning-id',
        examples: [
          {
            id: 'example-id',
            sentenceEn: 'Be resilient',
            sentenceVi: '',
            clozeSentenceEn: 'Be ________.',
            clozeAnswer: 'resilient'
          }
        ]
      },
      form.meanings[0]
    ]
  })
  assert.equal(result.meanings.length, 2)
  assert.equal(result.meanings[0].id, 'meaning-id')
  assert.equal(result.meanings[0].examples[0].id, 'example-id')
})
