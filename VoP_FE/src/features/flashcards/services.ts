import { api } from '@/lib/axios'
import type { Page } from '@/types/api.type'
import type { Vocabulary } from '@/features/vocabularies/types'
export default {
  list: async (page: number) =>
    (
      await api.get<Page<Vocabulary>>('/flashcards', {
        params: { page, pageSize: 1 }
      })
    ).data,
  rate: async ({
    id,
    rating
  }: {
    id: string
    rating: 'remembered' | 'forgotten'
  }) => {
    await api.post(`/flashcards/${id}/reviews`, { rating })
  }
}
