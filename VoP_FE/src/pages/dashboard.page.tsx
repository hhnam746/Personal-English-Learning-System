import { useSearchParams } from 'react-router-dom'
import {
  useDashboard,
  useDuePreview
} from '@/features/dashboard/hooks/use-dashboard'
import { DashboardContent } from '@/features/dashboard/components/dashboard-content'
import { LoadingState, ErrorState } from '@/components/query-state'
export default function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const days = params.get('days') === '14' ? 14 : 7
  const query = useDashboard(days)
  const due = useDuePreview()
  return (
    <>
      <div className="page-heading">
        <h1>
          Tiếp tục <span className="orange-word">hành trình</span> nhé!
        </h1>
      </div>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <DashboardContent
          data={query.data}
          days={days}
          onDays={(value) =>
            setParams((p) => {
              const n = new URLSearchParams(p)
              n.set('days', String(value))
              return n
            })
          }
          dueWords={due.data?.items || []}
          dueError={due.isError}
          onDueRetry={() => void due.refetch()}
        />
      )}
    </>
  )
}
