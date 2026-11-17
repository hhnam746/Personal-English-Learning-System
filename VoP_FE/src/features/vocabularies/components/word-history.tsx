import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Page } from '@/types/api.type'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface Evaluation {
  id: string
  meaningId: string | null
  isLegacy: boolean
  levelBefore: number
  levelAfter: number
  evaluatedAt: string
}

interface LegacyProgress {
  level: number
  nextReviewAt: string | null
  mappedMeaningId: string | null
}

const date = (value: string) => new Date(value).toLocaleString('vi-VN')

export function WordHistory({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const progress = useQuery({
    queryKey: ['vocabularies', id, 'legacy'],
    enabled: open,
    queryFn: async ({ signal }) =>
      (
        await api.get<{ legacy: LegacyProgress | null }>(
          `/learning-progress/${id}`,
          { signal }
        )
      ).data
  })
  const history = useQuery({
    queryKey: ['vocabularies', id, 'history', page],
    enabled: open,
    queryFn: async ({ signal }) =>
      (
        await api.get<Page<Evaluation>>(
          `/learning-progress/${id}/evaluations`,
          { params: { page }, signal }
        )
      ).data
  })
  return (
    <details onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Lịch sử ôn tập</summary>
      {open && (
        <>
          {progress.data?.legacy && (
            <p className="muted">
              Lịch sử theo từ · Level {progress.data.legacy.level}
              {progress.data.legacy.nextReviewAt &&
                ` · Lịch ôn cũ: ${date(progress.data.legacy.nextReviewAt)}`}
              {' · '}
              {progress.data.legacy.mappedMeaningId
                ? 'Đã đối chiếu với nghĩa'
                : 'Chưa xác định được nghĩa'}
            </p>
          )}
          {(progress.isPending || history.isPending) && (
            <p role="status">Đang tải lịch sử…</p>
          )}
          {(progress.isError || history.isError) && (
            <p role="alert">Không tải được toàn bộ lịch sử.</p>
          )}
          {history.data?.items.length === 0 && <p>Chưa có lượt ôn.</p>}
          {history.data?.items.map((item) => (
            <p key={item.id}>
              {item.isLegacy ? 'Theo từ' : 'Theo nghĩa'} · Level{' '}
              {item.levelBefore} → {item.levelAfter} · {date(item.evaluatedAt)}
            </p>
          ))}
          {(page > 1 ||
            (history.data &&
              page * history.data.pageSize < history.data.totalItems)) && (
            <div className="form-actions">
              <Button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Trang trước
              </Button>
              <Button
                type="button"
                disabled={
                  !history.data ||
                  page * history.data.pageSize >= history.data.totalItems
                }
                onClick={() => setPage(page + 1)}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </details>
  )
}
