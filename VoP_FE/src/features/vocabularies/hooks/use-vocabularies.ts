import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import vocabularyService from '../services'
import type { VocabularyFilters } from '../types'
export function useVocabularies(filters: VocabularyFilters) {
  return useQuery({
    queryKey: [...queryKeys.vocabularies, 'list', filters],
    queryFn: ({ signal }) => vocabularyService.list(filters, signal),
    placeholderData: keepPreviousData
  })
}
export function useVocabulary(id: string) {
  return useQuery({
    queryKey: queryKeys.vocabulary(id),
    queryFn: ({ signal }) => vocabularyService.get(id, signal),
    enabled: !!id
  })
}
