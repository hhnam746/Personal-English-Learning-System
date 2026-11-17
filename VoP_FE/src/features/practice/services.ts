import { api } from '@/lib/axios'
import type { Page } from '@/types/api.type'
import type { Session, Question, Answer, Attempt } from './types'
export default {
  latest: async () => {
    let page = 1
    let scanned = 0
    let total: number
    do {
      const { data } = await api.get<Page<Session>>('/practice-sessions', {
        params: { page: page++, pageSize: 100 }
      })
      const active = data.items.find((s) => s.status === 'in_progress')
      if (active) return active
      scanned += data.items.length
      total = data.totalItems
    } while (scanned < total)
    return null
  },
  attempts: async (id: string) => {
    const items: Attempt[] = []
    let page = 1
    let total: number
    do {
      const { data } = await api.get<Page<Attempt>>(
        `/practice-sessions/${id}/attempts`,
        { params: { page: page++, pageSize: 100 } }
      )
      items.push(...data.items)
      total = data.totalItems
    } while (items.length < total)
    return items
  },
  skipAudio: async ({ sessionId, questionId }: { sessionId: string; questionId: string }) => {
    await api.post(`/practice-sessions/${sessionId}/questions/${questionId}/skip-audio`)
  },
  start: async (audioEnabled: boolean) =>
    (await api.post<Session>('/practice-sessions', { audioEnabled })).data,
  get: async (id: string) =>
    (await api.get<Session>(`/practice-sessions/${id}`)).data,
  next: async (id: string) => {
    const response = await api.get<Question>(
      `/practice-sessions/${id}/next-question`
    )
    return response.status === 204 ? null : response.data
  },
  answer: async ({
    sessionId,
    questionId,
    answer
  }: {
    sessionId: string
    questionId: string
    answer: string
  }) =>
    (
      await api.post<Answer>(`/practice-sessions/${sessionId}/answers`, {
        questionId,
        answer
      })
    ).data,
  complete: async (id: string) =>
    (await api.post<Session>(`/practice-sessions/${id}/complete`)).data,
  abandon: async (id: string) =>
    (await api.post<Session>(`/practice-sessions/${id}/abandon`)).data
}
