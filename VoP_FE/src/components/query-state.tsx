import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { apiError } from '@/shared/api-error'
export function LoadingState() {
  return (
    <div className="query-loading" role="status" aria-label="Đang tải dữ liệu">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
export function ErrorState({
  error,
  retry
}: {
  error: unknown
  retry: () => void
}) {
  return (
    <div className="empty-state glass-panel" role="alert">
      <h2>Chưa tải được dữ liệu</h2>
      <p>{apiError(error)}</p>
      <Button className="btn btn-primary" onClick={retry}>
        Thử lại
      </Button>
    </div>
  )
}
