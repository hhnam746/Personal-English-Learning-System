import { api } from '@/lib/axios'
import type { Page } from '@/types/api.type'
import type { Vocabulary, VocabularyFilters, VocabularyInput } from './types'
const vocabularyService = {
  list: async (params: VocabularyFilters, signal?: AbortSignal) =>
    (await api.get<Page<Vocabulary>>('/vocabularies', { params, signal })).data,
  get: async (id: string, signal?: AbortSignal) =>
    (await api.get<Vocabulary>(`/vocabularies/${id}`, { signal })).data,
  save: async ({ id, data }: { id?: string; data: VocabularyInput }) =>
    id
      ? (await api.put<Vocabulary>(`/vocabularies/${id}`, data)).data
      : (await api.post<Vocabulary>('/vocabularies', data)).data,
  delete: async (id: string) => {
    await api.delete(`/vocabularies/${id}`)
  }
}
export default vocabularyService
