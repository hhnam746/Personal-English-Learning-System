import { api } from '@/lib/axios'
import type { Page } from '@/types/api.type'
import type { Session } from '@/features/practice/types'
export interface LearningProgress {
  vocabularyId: string
  meaningId: string
  meaningVi: string
  term: string
  level: number
  isSuspended: boolean
  firstLearnedAt: string | null
  lastReviewedAt: string | null
  nextReviewAt: string | null
}
export default {
  meanings: async (params: { dueOnly?: boolean; level?: number; suspended?: boolean; pageSize: number }, signal?: AbortSignal) =>
    (await api.get<Page<LearningProgress>>('/learning-progress', { params, signal })).data,
  due: async (signal?: AbortSignal) =>
    (
      await api.get<Page<LearningProgress>>('/learning-progress', {
        params: { dueOnly: true, pageSize: 5 },
        signal
      })
    ).data,
  sessions: async (page: number, signal?: AbortSignal) =>
    (
      await api.get<Page<Session>>('/practice-sessions', {
        params: { page, pageSize: 7 },
        signal
      })
    ).data
}
