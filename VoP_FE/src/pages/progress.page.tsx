import { useDashboard } from '@/features/dashboard/hooks/use-dashboard'
import { LoadingState, ErrorState } from '@/components/query-state'
export default function ProgressPage() {
  const query = useDashboard(14)
  return (
    <>
      <div className="page-heading">
        <h1>Tiến độ học tập</h1>
      </div>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <section className="glass-panel progress-summary">
          <h2>14 ngày gần đây (UTC)</h2>
          <p>
            Đã bắt đầu học {query.data.learnedWords} / {query.data.totalWords}{' '}
            từ.
          </p>
          <p>
            {query.data.correctAssessments} / {query.data.assessmentAnswers}{' '}
            lượt đánh giá đúng (toàn thời gian).
          </p>
          <div className="table-container">
            <table className="word-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Đánh giá</th>
                  <th>Đúng</th>
                  <th>Củng cố</th>
                  <th>Flashcard</th>
                  <th>Phiên hoàn tất</th>
                </tr>
              </thead>
              <tbody>
                {query.data.activity.map((d) => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td>{d.assessmentAnswers}</td>
                    <td>{d.correctAssessments}</td>
                    <td>{d.reinforcementAnswers}</td>
                    <td>{d.flashcardReviews}</td>
                    <td>{d.completedSessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
