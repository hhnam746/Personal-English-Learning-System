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
  const latest = useQuery({
    queryKey: ['practice', 'latest'],
    queryFn: service.latest,
    enabled: !id,
    staleTime: 0
  })
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
          async (w) => {
            const word = await vocabularyService.get(w.vocabularyId)
            return {
              ...word,
              id: w.id,
              meanings: w.meaningId ? word.meanings.filter(m => m.id === w.meaningId) : word.meanings
            }
          }
        )
      ),
    enabled: !!id && session.data?.status === 'in_progress' && !questions
  })
  const next = useQuery({
    queryKey: ['practice', id, 'question'],
    queryFn: () => service.next(id),
    enabled: !!id && questions && session.data?.status === 'in_progress',
    retry: false,
    staleTime: Infinity,
    refetchOnMount: 'always'
  })
  const attempts = useQuery({
    queryKey: ['practice', id, 'attempts'],
    queryFn: () => service.attempts(id),
    enabled: !!id && session.data?.status === 'completed'
  })
  const start = useMutation({ mutationFn: service.start, onError: error })
  const skipAudio = useMutation({
    mutationFn: service.skipAudio,
    onSuccess: async () => {
      await next.refetch()
      await refresh()
    },
    onError: error
  })
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
  return {
    feedback:
      answer.variables?.sessionId === id &&
      answer.variables?.questionId === next.data?.id
        ? answer.data
        : undefined,
    latest,
    session,
    intro,
    next,
    attempts,
    start,
    answer,
    complete,
    abandon,
    skipAudio,
    advance
  }
}
