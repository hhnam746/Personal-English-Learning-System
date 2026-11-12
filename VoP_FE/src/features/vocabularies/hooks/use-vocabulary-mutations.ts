import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import { apiError } from '@/shared/api-error'
import vocabularyService from '../services'
export function useVocabularyMutations() {
  const client = useQueryClient()
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.vocabularies }),
      client.invalidateQueries({ queryKey: ['dashboard'] }),
      client.invalidateQueries({ queryKey: ['flashcards'] })
    ])
  }
  const save = useMutation({
    mutationFn: vocabularyService.save,
    onSuccess: async () => {
      await refresh()
      toast.success('Đã lưu từ vựng')
    },
    onError: (e) => toast.error(apiError(e))
  })
  const remove = useMutation({
    mutationFn: vocabularyService.delete,
    onSuccess: async () => {
      await refresh()
      toast.success('Đã xóa từ khỏi kho')
    },
    onError: (e) => toast.error(apiError(e))
  })
  return { save, remove }
}
