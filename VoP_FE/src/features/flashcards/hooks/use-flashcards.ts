import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiError } from '@/shared/api-error'
import service from '../services'
export function useFlashcards(page: number, level?: number) {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['flashcards', level, page],
    refetchOnMount: 'always',
    queryFn: ({ signal }) => service.list(page, level, signal)
  })
  const rate = useMutation({
    mutationKey: ['flashcard-review'],
    mutationFn: service.rate,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Đã ghi nhận. Flashcard không thay đổi Level.')
    },
    onError: (e) => toast.error(apiError(e))
  })
  return { query, rate }
}
