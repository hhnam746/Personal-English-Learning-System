import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  Layers,
  BookOpen,
  CalendarDays,
  Play,
  ArrowRight,
  Clock3,
  ChartNoAxesColumn,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SummaryBlob } from '@/components/organic-summary'
import { AccuracyBlob } from '@/components/organic-accuracy'
import { BrainBlob } from '@/components/organic-brain'
import { useWordDialog } from '@/features/vocabularies/hooks/use-word-dialog'
import type { Dashboard } from '../types'
import { ActivityChart } from './activity-chart'
const progress = (n: number): CSSProperties =>
  ({ '--progress': `${Math.max(0, Math.min(100, n))}%` }) as CSSProperties
export function DashboardContent({
  data,
  days,
  onDays,
  dueWords,
  dueError,
  onDueRetry
}: {
  data: Dashboard
  days: number
  onDays: (days: number) => void
  dueWords: { vocabularyId: string; term: string }[]
  dueError: boolean
  onDueRetry: () => void
}) {
  const dialog = useWordDialog()
  const max = Math.max(
    1,
    ...data.levels.filter((l) => l.level > 0).map((l) => l.count)
  )
  return (
    <div className="dashboard-composition">
      <div className="dashboard-top">
        <SummaryBlob className="vocabulary-summary">
          <h2>Tổng số từ vựng</h2>
          <div className="vocab-total">
            <strong>{data.totalWords}</strong>
          </div>
          <div
            className="meter"
            role="progressbar"
            aria-label="Tỷ lệ từ đã bắt đầu học"
            aria-valuenow={data.learnedWords}
            aria-valuemin={0}
            aria-valuemax={Math.max(data.totalWords, 1)}
            style={progress(
              data.totalWords ? (data.learnedWords / data.totalWords) * 100 : 0
            )}
          >
            <span />
          </div>
          <div className="vocab-breakdown">
            <span>
              <BookOpen className="icon" /> Đã học{' '}
              <strong>{data.learnedWords}</strong> từ
            </span>
            <Link className="text-link" to="/library?filter=0">
              Chưa học <strong>{data.newWords}</strong> từ
            </Link>
          </div>
        </SummaryBlob>
        <section className="memory-distribution" aria-labelledby="memory-title">
          <h2 id="memory-title">
            <Layers className="icon" /> Phân bố theo mức ghi nhớ
          </h2>
          <div
            className="memory-chart"
            role="group"
            aria-label="Phân bố 5 cấp độ ghi nhớ"
          >
            {data.levels
              .filter((l) => l.level > 0)
              .map((l) => (
                <Link
                  className={`memory-column level-${l.level}`}
                  key={l.level}
                  to={`/library?filter=${l.level}`}
                  aria-label={`Level ${l.level}: ${l.count} từ. Xem các từ.`}
                >
                  <span className="bar-count">{l.count}</span>
                  <span
                    className="memory-bar"
                    style={
                      {
                        '--bar-height': `${l.count ? Math.max(18, (l.count / max) * 100) : 1}%`
                      } as CSSProperties
                    }
                  >
                    <span className="bar-highlight" />
                    <span className="bar-glyph">
                      {['·', '⋮', '∴', '⁖', '✳'][l.level - 1]}
                    </span>
                  </span>
                  <span className="bar-label">Level {l.level}</span>
                </Link>
              ))}
          </div>
        </section>
        <section className="surface surface-accent upcoming-panel">
          <h2>
            <CalendarDays className="icon" /> Đến lúc ôn lại
          </h2>
          <div className="review-total">
            <strong>{data.dueWords}</strong>
            <span>từ đang chờ bạn</span>
          </div>
          <div className="due-words">
            {dueError ? (
              <button className="text-link" onClick={onDueRetry}>
                Chưa tải được từ đến hạn. Thử lại
              </button>
            ) : dueWords.length ? (
              dueWords.map((w) => (
                <button
                  className="word-chip"
                  key={w.vocabularyId}
                  onClick={() => dialog.openDetail(w.vocabularyId)}
                >
                  {w.term}
                </button>
              ))
            ) : (
              <span className="muted">Chưa có từ đến hạn.</span>
            )}
          </div>
          <Button className="btn btn-primary" asChild>
            <Link to="/practice">
              <Play />
              Bắt đầu luyện tập
              <span className="btn-icon">
                <ArrowRight />
              </span>
            </Link>
          </Button>
          <Link className="text-link review-footer" to="/library?filter=due">
            <Clock3 className="icon" />
            Xem {data.dueWords} từ đến hạn <ArrowRight className="icon" />
          </Link>
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="surface dashboard-activity">
          <div className="panel-top">
            <h2>
              <ChartNoAxesColumn className="icon" /> Hoạt động học tập
            </h2>
            <select
              className="glass-control"
              aria-label="Khoảng thời gian hoạt động"
              value={days}
              onChange={(e) => onDays(Number(e.target.value))}
            >
              <option value={7}>7 ngày gần đây</option>
              <option value={14}>14 ngày gần đây</option>
            </select>
          </div>
          <ActivityChart days={data.activity} />
          <p className="chart-note">Lượt đánh giá · Ngày UTC</p>
        </section>
        <AccuracyBlob className="accuracy-panel accuracy-panel--with-brain">
          <h2>
            <Target className="icon" /> Tỷ lệ trả lời đúng
          </h2>
          <strong className="accuracy-total">
            {data.accuracyPercent === null
              ? '—'
              : Math.round(data.accuracyPercent)}
            {data.accuracyPercent !== null && <span>%</span>}
          </strong>
          <p>
            {data.correctAssessments} / {data.assessmentAnswers} lượt đánh giá
          </p>
          <div
            className="meter"
            aria-label="Tỷ lệ trả lời đúng"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={data.accuracyPercent ?? 0}
            style={progress(data.accuracyPercent ?? 0)}
          >
            <span />
          </div>
          <BrainBlob />
        </AccuracyBlob>
      </div>
      {data.totalWords === 0 && (
        <p className="dashboard-empty" role="status">
          Kho từ đang trống. Thêm từ đầu tiên để bắt đầu hành trình.
        </p>
      )}
    </div>
  )
}
