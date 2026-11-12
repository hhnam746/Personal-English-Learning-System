import { api } from '@/lib/axios'
import type { Session, Question, Answer } from './types'
export default {
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
