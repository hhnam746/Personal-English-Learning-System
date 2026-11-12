import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiError } from '@/shared/api-error'
import service from '../services'
import vocabularyService from '@/features/vocabularies/services'
export function usePractice(id: string, questions: boolean) {
  const client = useQueryClient()
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ['dashboard'] }),
      client.invalidateQueries({ queryKey: ['vocabularies'] }),
      client.invalidateQueries({ queryKey: ['practice', id, 'session'] })
    ])
  }
  const error = (e: unknown) => toast.error(apiError(e))
  const session = useQuery({
    queryKey: ['practice', id, 'session'],
    queryFn: () => service.get(id),
    enabled: !!id,
    retry: false
  })
  const intro = useQuery({
    queryKey: ['practice', id, 'intro'],
    queryFn: () =>
      Promise.all(
        (session.data?.words.filter((w) => w.levelAtStart === 0) || []).map(
          (w) => vocabularyService.get(w.vocabularyId)
        )
      ),
    enabled: !!id && session.isSuccess && !questions
  })
  const next = useQuery({
    queryKey: ['practice', id, 'question'],
    queryFn: () => service.next(id),
    enabled: !!id && questions && session.data?.status === 'in_progress',
    retry: false,
    staleTime: Infinity,
    refetchOnMount: 'always'
  })
  const start = useMutation({ mutationFn: service.start, onError: error })
  const answer = useMutation({ mutationFn: service.answer, onError: error })
  const complete = useMutation({
    mutationFn: service.complete,
    onSuccess: refresh,
    onError: error
  })
  const abandon = useMutation({
    mutationFn: service.abandon,
    onSuccess: refresh,
    onError: error
  })
  const advance = async () => {
    const result = await next.refetch()
    if (result.isSuccess) {
      answer.reset()
      await refresh()
    }
  }
  return { session, intro, next, start, answer, complete, abandon, advance }
}
