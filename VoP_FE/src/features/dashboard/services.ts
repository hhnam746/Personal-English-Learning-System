import { api } from '@/lib/axios'
import type { Page } from '@/types/api.type'
import type { Dashboard } from './types'
export default {
  due: async (signal?: AbortSignal) =>
    (
      await api.get<Page<{ vocabularyId: string; meaningId: string; meaningVi: string; term: string }>>(
        '/learning-progress',
        { params: { dueOnly: true, pageSize: 3 }, signal }
      )
    ).data,
  get: async (days: number, signal?: AbortSignal) =>
    (await api.get<Dashboard>('/dashboard', { params: { days }, signal })).data
}
