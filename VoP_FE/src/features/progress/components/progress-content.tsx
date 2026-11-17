import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sprout, Leaf, Info, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState } from '@/components/query-state'
import { useWordDialog } from '@/features/vocabularies/hooks/use-word-dialog'
import { ActivityChart } from '@/features/dashboard/components/activity-chart'
import type { Dashboard } from '@/features/dashboard/types'
import { useProgressDue, useProgressSessions } from '../hooks/use-progress'
const levelNames = [
  'Chưa học',
  'Mới làm quen',
  'Đang ghi nhớ',
  'Dần vững vàng',
  'Nhớ tốt',
  'Thành thạo'
]
const date = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC'
  }).format(new Date(value))
function DueWords() {
  const query = useProgressDue()
  const dialog = useWordDialog()
  return (
    <section className="weak-words glass-panel">
      <div className="panel-top">
        <h2>Đến lúc ôn lại</h2>
        <Leaf className="icon" />
      </div>
      <p className="muted">
        Ưu tiên lịch ôn sớm nhất.
      </p>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          {query.data.items.map((w) => (
            <button
              className="weak-row"
              key={w.meaningId}
              onClick={() => dialog.openDetail(w.vocabularyId)}
            >
              <div>
                <strong>{w.term} · {w.meaningVi}</strong>
                <span>
                  Hạn ôn: {w.nextReviewAt ? date(w.nextReviewAt) : '—'} UTC
                </span>
              </div>
              <span className={`level-tag level-${w.level}`}>
                <span />L{w.level}
              </span>
              <ArrowRight className="icon" />
            </button>
          ))}
          {!query.data.totalItems && (
            <p>
              Hiện không có nghĩa đến hạn. Bạn có thể học từ mới hoặc ôn tự do bằng
              Flashcard.
            </p>
          )}
          <Link className="text-link" to="/library?filter=due">
            Xem tất cả {query.data.totalItems} nghĩa đến hạn{' '}
            <ArrowRight className="icon" />
          </Link>
        </>
      )}
      <div className="maintenance-note glass-inset">
        <Info className="icon" aria-hidden="true" />
        <p>Level không tự giảm khi nghỉ học. Level 5 vẫn cần ôn duy trì.</p>
      </div>
    </section>
  )
}
function SessionHistory() {
  const [page, setPage] = useState(1)
  const query = useProgressSessions(page)
  const labels = {
    in_progress: 'Đang học',
    completed: 'Hoàn tất',
    abandoned: 'Đã bỏ dở'
  }
  return (
    <section className="history-section glass-panel">
      <div className="panel-top">
        <h2>Những phiên gần đây</h2>
        <span className="subtle-label">
          {query.data?.totalItems ?? '—'} phiên · UTC
        </span>
      </div>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          {query.data.items.length ? (
            <div aria-label="Phiên luyện tập, thời gian UTC">
              {query.data.items.map((session) => (
                <Link
                  className="history-row"
                  key={session.id}
                  to={`/practice?session=${session.id}`}
                >
                  <span>
                    <Zap className="icon" aria-hidden="true" />
                    {date(session.startedAt)}
                  </span>
                  <span>{session.words.length} {session.words.some(w => w.isLegacy) ? 'từ' : 'nghĩa'}</span>
                  <span>{session.answeredCount} lượt trả lời</span>
                  <span>{labels[session.status]}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p>Chưa có phiên luyện tập nào.</p>
          )}
          <div className="pagination">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Trang trước
            </Button>
            <span>
              Trang {page} / {Math.max(1, Math.ceil(query.data.totalItems / 7))}
            </span>
            <Button
              variant="outline"
              disabled={page * 7 >= query.data.totalItems}
              onClick={() => setPage(page + 1)}
            >
              Trang sau
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
export function ProgressContent({
  data,
  days,
  onDays,
  dailyOpen,
  onDailyOpen
}: {
  data: Dashboard
  dailyOpen: boolean
  onDailyOpen: (open: boolean) => void
  days: number
  onDays: (days: number) => void
}) {
  const totals = data.activity.reduce(
    (sum, d) => ({
      assessment: sum.assessment + d.assessmentAnswers,
      correct: sum.correct + d.correctAssessments,
      reinforcement: sum.reinforcement + d.reinforcementAnswers,
      cards: sum.cards + d.flashcardReviews,
      sessions: sum.sessions + d.completedSessions
    }),
    { assessment: 0, correct: 0, reinforcement: 0, cards: 0, sessions: 0 }
  )
  const level5 = data.masteredMeanings
  return (
    <>
      {!data.totalWords && (
        <div className="maintenance-note glass-inset">
          <p>
            Kho từ đang trống.{' '}
            <Link className="text-link" to="/library">
              Thêm từ đầu tiên
            </Link>{' '}
            để bắt đầu theo dõi tiến độ.
          </p>
        </div>
      )}
      <section className="progress-overview glass-panel glass-panel--peach">
        <div className="mastery-number">
          <span className="eyebrow">NGHĨA ĐANG Ở LEVEL 5</span>
          <strong>
            {level5}
            <span> / {data.totalMeanings}</span>
          </strong>
          <p>Ghi nhớ ở cấp cao nhất, vẫn cần ôn duy trì.</p>
        </div>
        <div className="progress-stats">
          <div>
            <strong>{data.learnedMeanings}</strong>
            <span>nghĩa đã bắt đầu học</span>
            <Link className="text-link" to="/library?filter=0">
              {data.newMeanings} nghĩa chưa học
            </Link>
          </div>
          <div>
            <strong>
              {data.accuracyPercent === null ? '—' : `${data.accuracyPercent}%`}
            </strong>
            <span>
              {data.correctAssessments} / {data.assessmentAnswers} lượt đánh giá
              đúng
            </span>
            <small className="muted">Toàn thời gian</small>
          </div>
        </div>
      </section>
      <div className="progress-layout">
        <section className="level-journey glass-panel">
          <div className="panel-top">
            <h2>Hành trình ghi nhớ</h2>
            <Sprout className="icon" />
          </div>
          {data.levels
            .filter((l) => l.level > 0)
            .map((l) => (
              <Link
                key={l.level}
                className={`journey-row level-${l.level}`}
                to={`/library?filter=${l.level}`}
              >
                <span className="journey-number">
                  {String(l.level).padStart(2, '0')}
                </span>
                <div>
                  <strong>{levelNames[l.level]}</strong>
                  <div className="journey-track">
                    <span
                      style={{
                        transform: `scaleX(${data.totalMeanings ? l.count / data.totalMeanings : 0})`
                      }}
                    />
                  </div>
                </div>
                <span>
                  {l.count}
                  <small> từ</small>
                </span>
                <ArrowRight className="icon" />
              </Link>
            ))}
          <p className="proposal-caption">
            Phân bố hiện tại trên tổng số từ, không phải biểu đồ tăng Level theo
            thời gian.
          </p>
        </section>
        <DueWords />
      </div>
      <SessionHistory />
      <section className="history-section glass-panel progress-activity">
        <div className="panel-top">
          <h2>Hoạt động học tập</h2>
          <Select
            value={String(days)}
            onValueChange={(value) => onDays(Number(value))}
          >
            <SelectTrigger
              className="glass-control"
              aria-label="Khoảng thời gian hoạt động"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              <SelectGroup>
                {[7, 14, 30].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} ngày gần đây
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <p className="chart-note">
          Ngày UTC. Chỉ lượt đánh giá được tính vào tỷ lệ đúng; không gồm củng
          cố hoặc Flashcard, kể cả khi phiên bị bỏ dở.
        </p>
        <ActivityChart days={data.activity} />
        <div
          className="progress-period-stats"
          aria-label="Thống kê trong khoảng đã chọn"
        >
          <div>
            <strong>{totals.assessment}</strong>
            <span>lượt đánh giá</span>
          </div>
          <div>
            <strong>
              {totals.assessment
                ? `${Math.round((totals.correct / totals.assessment) * 100)}%`
                : '—'}
            </strong>
            <span>đúng trong {days} ngày</span>
          </div>
          <div>
            <strong>{totals.reinforcement}</strong>
            <span>lượt củng cố</span>
          </div>
          <div>
            <strong>{totals.cards}</strong>
            <span>lượt Flashcard</span>
          </div>
          <div>
            <strong>{totals.sessions}</strong>
            <span>phiên hoàn tất</span>
          </div>
        </div>
        <Collapsible
          className="progress-daily"
          open={dailyOpen}
          onOpenChange={onDailyOpen}
        >
          <CollapsibleTrigger className="text-link">
            Xem số liệu từng ngày
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="table-container">
              <table className="word-table">
                <thead>
                  <tr>
                    <th>Ngày UTC</th>
                    <th>Đánh giá</th>
                    <th>Đúng</th>
                    <th>Củng cố</th>
                    <th>Flashcard</th>
                    <th>Phiên hoàn tất</th>
                  </tr>
                </thead>
                <tbody>
                  {data.activity.map((d) => (
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
          </CollapsibleContent>
        </Collapsible>
      </section>
    </>
  )
}
