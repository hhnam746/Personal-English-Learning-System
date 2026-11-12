import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiError } from '@/shared/api-error'
import service from '../services'
export function useFlashcards(page: number) {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['flashcards', page],
    queryFn: () => service.list(page)
  })
  const rate = useMutation({
    mutationFn: service.rate,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Đã ghi nhận. Flashcard không thay đổi Level.')
    },
    onError: (e) => toast.error(apiError(e))
  })
  return { query, rate }
}
