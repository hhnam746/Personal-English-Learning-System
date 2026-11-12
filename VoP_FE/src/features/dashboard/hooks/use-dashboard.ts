import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import dashboardService from '../services'
export function useDashboard(days: number) {
  return useQuery({
    queryKey: queryKeys.dashboard(days),
    queryFn: ({ signal }) => dashboardService.get(days, signal),
    refetchInterval: 60_000
  })
}

export function useDuePreview() {
  return useQuery({
    queryKey: ['vocabularies', 'due-preview'],
    queryFn: ({ signal }) => dashboardService.due(signal),
    refetchInterval: 60_000
  })
}
