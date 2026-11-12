export const queryKeys = {
  dashboard: (days: number) => ['dashboard', days] as const,
  vocabularies: ['vocabularies'] as const,
  vocabulary: (id: string) => ['vocabularies', 'detail', id] as const,
  practice: ['practice'] as const
}
