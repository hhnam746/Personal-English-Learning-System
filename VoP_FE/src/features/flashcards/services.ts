import { api } from '@/lib/axios'
import type { Page } from '@/types/api.type'
import type { Vocabulary } from '@/features/vocabularies/types'
export type Rating = 'remembered' | 'forgotten'
export default {
  list: async (page: number, level: number | undefined, signal?: AbortSignal) =>
    (
      await api.get<Page<Vocabulary>>('/flashcards', {
        params: { page, level, pageSize: 1 },
        signal
      })
    ).data,
  rate: async ({ id, meaningId, rating }: { id: string; meaningId?: string; rating: Rating }) => {
    await api.post(`/flashcards/${id}/reviews`, { meaningId, rating })
  }
}
