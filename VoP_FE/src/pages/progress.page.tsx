import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard'
import { LoadingState, ErrorState } from '@/components/query-state'
import { ProgressContent } from '@/features/progress/components/progress-content'
export default function ProgressPage() {
  const [params, setParams] = useSearchParams()
  const [dailyOpen, setDailyOpen] = useState(false)
  const requested = Number(params.get('days'))
  const days = [7, 14, 30].includes(requested) ? requested : 14
  const query = useDashboard(days)
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Tiến độ học tập</h1>
          <p>Theo dõi cấp độ ghi nhớ và kết quả luyện tập.</p>
        </div>
      </div>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <ProgressContent
          dailyOpen={dailyOpen}
          onDailyOpen={setDailyOpen}
          data={query.data}
          days={days}
          onDays={(days) => setParams({ days: String(days) })}
        />
      )}
    </>
  )
}
