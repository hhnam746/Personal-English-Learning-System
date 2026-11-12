import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState } from '@/components/query-state'
import { usePracticeStore } from '@/lib/zustand/practice.store'
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard'
import { usePractice } from '@/features/practice/hooks/use-practice'
import { QuestionForm } from '@/features/practice/components/question-form'
export default function PracticePage() {
  const { sessionId: activeSession, setSession } = usePracticeStore()
  const [params, setParams] = useSearchParams()
  const id = params.get('session') || ''
  const questions = params.get('questions') === '1'
  const [audio, setAudio] = useState(false)
  const data = usePractice(id, questions)
  const dashboard = useDashboard(7)
  const intro = data.intro
  const pending =
    data.start.isPending || data.complete.isPending || data.abandon.isPending
  const content = () => {
    if (!id)
      return (
        <div className="practice-setup">
          <section className="session-intro glass-panel">
            <h2>Nội dung luyện tập</h2>
            {activeSession && (
              <p>
                <Link
                  className="text-link"
                  to={`/practice?session=${activeSession}`}
                >
                  Tiếp tục phiên đang mở
                </Link>
              </p>
            )}
            <div className="session-facts">
              <span>
                <strong>{dashboard.data?.dueWords ?? '—'}</strong> từ đến hạn
              </span>
              <span>
                <strong>{dashboard.data?.newWords ?? '—'}</strong> từ chưa học
              </span>
            </div>
            <label className="audio-setting">
              <input
                type="checkbox"
                checked={audio}
                onChange={(e) => setAudio(e.target.checked)}
              />{' '}
              Bật câu hỏi nghe khi từ có URL âm thanh
            </label>
            <Button
              className="btn btn-primary"
              disabled={
                !!activeSession ||
                pending ||
                !dashboard.data ||
                dashboard.data.dueWords + dashboard.data.newWords === 0
              }
              onClick={() =>
                data.start.mutate(audio, {
                  onSuccess: (s) => {
                    setSession(s.id)
                    setParams({ session: s.id })
                  }
                })
              }
            >
              Bắt đầu luyện tập
            </Button>
            <p className="muted">
              Tối đa 12 từ theo mặc định hiện có của backend. Level và lịch ôn
              chỉ cập nhật khi hoàn thành.
            </p>
            {dashboard.isError && (
              <ErrorState
                error={dashboard.error}
                retry={() => void dashboard.refetch()}
              />
            )}
          </section>
        </div>
      )
    if (data.session.isPending) return <LoadingState />
    if (data.session.isError)
      return (
        <ErrorState
          error={data.session.error}
          retry={() => void data.session.refetch()}
        />
      )
    const session = data.session.data
    if (session.status !== 'in_progress')
      return (
        <div className="glass-panel result-page">
          <h2>
            {session.status === 'completed'
              ? 'Đã hoàn thành phiên luyện tập'
              : 'Phiên đã kết thúc'}
          </h2>
          <p>
            {session.answeredCount} lượt trả lời · {session.words.length} từ
          </p>
          <Button className="btn btn-primary" asChild>
            <Link to="/">Về tổng quan</Link>
          </Button>
          <Button
            className="btn btn-secondary"
            onClick={() => {
              setSession('')
              setParams({})
            }}
          >
            Phiên mới
          </Button>
        </div>
      )
    if (!questions)
      return (
        <section className="new-word-intro glass-panel">
          <h2>Làm quen từ mới</h2>
          {intro.isPending ? (
            <LoadingState />
          ) : intro.isError ? (
            <ErrorState
              error={intro.error}
              retry={() => void intro.refetch()}
            />
          ) : (
            intro.data.map((w) => (
              <article key={w.id}>
                <h3>
                  {w.term} <small>{w.ipa}</small>
                </h3>
                {w.meanings.map((m, i) => (
                  <p key={m.id || i}>{m.meaningVi}</p>
                ))}
              </article>
            ))
          )}
          <p className="muted">
            Phiên gồm {session.words.length} từ. Xem nghĩa trước khi luyện nhớ.
          </p>
          <Button
            className="btn btn-primary"
            disabled={intro.isPending || intro.isError}
            onClick={() => setParams({ session: id, questions: '1' })}
          >
            Bắt đầu câu hỏi
          </Button>
        </section>
      )
    if (data.next.isPending || (data.next.isFetching && !data.answer.data))
      return <LoadingState />
    if (data.next.isError)
      return (
        <ErrorState
          error={data.next.error}
          retry={() =>
            void (data.answer.data ? data.advance() : data.next.refetch())
          }
        />
      )
    if (!data.next.data)
      return (
        <div className="glass-panel result-page">
          <h2>Đã trả lời hết câu hỏi</h2>
          <Button
            className="btn btn-primary"
            disabled={pending}
            onClick={() =>
              data.complete.mutate(id, { onSuccess: () => setSession('') })
            }
          >
            Hoàn thành phiên
          </Button>
        </div>
      )
    const q = data.next.data
    return (
      <section className="glass-panel practice-question">
        <p className="muted">
          {session.answeredCount} lượt đã trả lời ·{' '}
          {q.role === 'reinforcement' ? 'Lượt củng cố' : 'Lượt đánh giá'}
        </p>
        {data.answer.data ? (
          <div className="answer-feedback" role="status">
            <h2>{data.answer.data.isCorrect ? 'Chính xác!' : 'Chưa đúng'}</h2>
            <p>
              Đáp án: <strong>{data.answer.data.correctAnswer}</strong>
            </p>
            <Button
              className="btn btn-primary"
              disabled={data.next.isFetching}
              onClick={() => void data.advance()}
            >
              Tiếp tục
            </Button>
          </div>
        ) : (
          <QuestionForm
            key={q.id}
            question={q}
            pending={data.answer.isPending}
            onAnswer={(answer) =>
              data.answer.mutate({ sessionId: id, questionId: q.id, answer })
            }
          />
        )}
      </section>
    )
  }
  return (
    <>
      <div className="page-heading">
        <h1>Luyện tập</h1>
      </div>
      {content()}
      {id && data.session.data?.status === 'in_progress' && (
        <Button
          className="btn btn-secondary quit-session"
          disabled={pending || data.answer.isPending}
          onClick={() => {
            if (
              window.confirm(
                'Thoát phiên? Kết quả dở dang không làm thay đổi Level.'
              )
            )
              data.abandon.mutate(id, { onSuccess: () => setSession('') })
          }}
        >
          Thoát phiên
        </Button>
      )}
    </>
  )
}
