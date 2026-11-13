import { useQuery } from '@tanstack/react-query'
import service from '../services'
export function useProgressDue() {
  return useQuery({
    queryKey: ['vocabularies', 'progress-due'],
    queryFn: ({ signal }) => service.due(signal),
    refetchInterval: 30_000
  })
}
export function useProgressSessions(page: number) {
  return useQuery({
    queryKey: ['practice', 'history', page],
    refetchOnMount: 'always',
    queryFn: ({ signal }) => service.sessions(page, signal)
  })
}
