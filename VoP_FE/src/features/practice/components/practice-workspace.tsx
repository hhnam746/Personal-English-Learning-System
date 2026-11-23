import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Zap, ArrowRight, Leaf, Info, X } from 'lucide-react'
import { SpeakButton } from '@/components/speak-button'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState } from '@/components/query-state'
import { usePracticeStore } from '@/lib/zustand/practice.store'
import { useQuery } from '@tanstack/react-query'
import progressService from '@/features/progress/services'
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard'
import { usePractice } from '@/features/practice/hooks/use-practice'
import { WordHistory } from '@/features/vocabularies/components/word-history'
import { QuestionForm } from '@/features/practice/components/question-form'
export function PracticeWorkspace() {
  const { sessionId: activeSession, setSession } = usePracticeStore()
  const [params, setParams] = useSearchParams()
  const id = params.get('session') || ''
  const questions = params.get('questions') === '1'
  const [audio, setAudio] = useState(false)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const quitButton = useRef<HTMLButtonElement>(null)
  const data = usePractice(id, questions)
  const dashboard = useDashboard(7)
  const due = useQuery({ queryKey: ['dashboard', 'practice-due'], enabled: !id,
    queryFn: ({ signal }) => progressService.meanings({ dueOnly: true, pageSize: 8 }, signal) })
  const fresh = useQuery({ queryKey: ['dashboard', 'practice-fresh'], enabled: !id,
    queryFn: ({ signal }) => progressService.meanings({ level: 0, suspended: false, pageSize: 4 }, signal) })
  const intro = data.intro
  useEffect(() => {
    if (data.session.data?.status === 'in_progress') setSession(id)
    else if (data.session.data && activeSession === id) setSession('')
  }, [data.session.data, activeSession, id, setSession])
  useEffect(() => {
    if (!id && data.latest.isSuccess)
      setSession(
        data.latest.data?.status === 'in_progress' ? data.latest.data.id : ''
      )
  }, [id, data.latest.isSuccess, data.latest.data, setSession])
  const pending =
    data.start.isPending || data.complete.isPending || data.abandon.isPending
  const quit = (
    <Button
      ref={quitButton}
      variant="ghost"
      className="icon-button"
      aria-label="Thoát phiên"
      disabled={pending || data.answer.isPending}
      onClick={() => setConfirmQuit(true)}
    >
      <X className="icon" aria-hidden="true" />
    </Button>
  )
  const loadingQuestion =
    data.next.isPending || (data.next.isFetching && !data.feedback)
  const content = () => {
    if (!id)
      return (
        <div className="practice-setup">
          <section className="session-intro glass-panel glass-panel--peach">
            <div className="session-intro__heading">
              <span className="round-emblem">
                <Zap className="icon" aria-hidden="true" />
              </span>
              <h2>Nội dung luyện tập</h2>
            </div>
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
                <strong>{dashboard.data?.dueMeanings ?? '—'}</strong> nghĩa đến hạn
              </span>
              <span>
                <strong>{dashboard.data?.newMeanings ?? '—'}</strong> nghĩa chưa học
              </span>
              <span>
                <strong>{audio ? 4 : 2}</strong> dạng bài hỗ trợ
              </span>
            </div>
            <label className="audio-setting">
              <Checkbox
                checked={audio}
                onCheckedChange={(checked) => setAudio(checked === true)}
              />{' '}
              Bật câu hỏi nghe khi có âm thanh offline
            </label>
            <Button
              className="btn btn-primary"
              disabled={
                !!activeSession ||
                data.latest.isPending ||
                data.latest.isError ||
                pending ||
                !dashboard.data ||
                dashboard.data.dueMeanings + dashboard.data.availableNewMeanings === 0
              }
              onClick={() =>
                data.start.mutate(audio, {
                  onSuccess: (s) => {
                    data.answer.reset()
                    setSession(s.id)
                    setParams({ session: s.id })
                  }
                })
              }
            >
              Bắt đầu luyện tập
              <span className="btn-icon">
                <ArrowRight className="icon" aria-hidden="true" />
              </span>
            </Button>
            <p className="setup-note">
              Tối đa 12 nghĩa mỗi phiên. Level và lịch ôn
              chỉ cập nhật khi hoàn thành.
            </p>
            {data.latest.isError && (
              <ErrorState
                error={data.latest.error}
                retry={() => void data.latest.refetch()}
              />
            )}
            {dashboard.isError && (
              <ErrorState
                error={dashboard.error}
                retry={() => void dashboard.refetch()}
              />
            )}
          </section>
          <aside className="session-plan glass-panel">
            <h3>Nghĩa có thể gặp trong phiên</h3>
            {due.isError || fresh.isError ? (
              <ErrorState
                error={due.error || fresh.error}
                retry={() => {
                  void due.refetch()
                  void fresh.refetch()
                }}
              />
            ) : due.isPending || fresh.isPending ? (
              <LoadingState />
            ) : (
              <div className="session-word-list">
                {[
                  ...due.data.items,
                  ...fresh.data.items.filter((word) => !word.isSuspended)
                ].map((word) => (
                  <div key={word.meaningId}>
                    <span>{word.term} · {word.meaningVi}</span>
                    <span className={`level-tag level-${word.level}`}>
                      <span />
                      {word.level ? `Level ${word.level}` : 'Chưa học'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="proposal-note">
              <Info className="icon" aria-hidden="true" />
              Danh sách xem trước. Hệ thống chọn tối đa 12 nghĩa khi bắt đầu.
            </p>
            {dashboard.data &&
              dashboard.data.dueMeanings + dashboard.data.availableNewMeanings === 0 && (
                <p className="setup-note">
                  Chưa có nghĩa cần học.{' '}
                  <Link className="text-link" to="/library">
                    Thêm từ mới
                  </Link>{' '}
                  hoặc{' '}
                  <Link className="text-link" to="/flashcards">
                    ôn Flashcard
                  </Link>
                  .
                </p>
              )}
          </aside>
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
          <div className="result-emblem">
            <Leaf className="icon" aria-hidden="true" />
          </div>
          <h2>
            {session.status === 'completed'
              ? 'Đã hoàn thành phiên luyện tập'
              : 'Phiên đã kết thúc'}
          </h2>
          <p>{session.words.length} {session.words.some(w => w.isLegacy) ? 'từ' : 'nghĩa'} trong phiên của bạn.</p>
          <div className="result-metrics glass-inset">
            <div>
              <strong>{session.words.length}</strong>
              <span>{session.words.some(w => w.isLegacy) ? 'từ luyện tập' : 'nghĩa luyện tập'}</span>
            </div>
            <div>
              <strong>{session.answeredCount}</strong>
              <span>lượt trả lời</span>
            </div>
            <div>
              <strong>
                {data.attempts.data
                  ? (() => {
                      const scored = data.attempts.data.filter(
                        (a) => a.role === 'assessment' && !a.type.startsWith('listen')
                      )
                      return scored.length
                        ? Math.round(
                            (scored.filter((a) => a.isCorrect).length /
                              scored.length) *
                              100
                          ) + '%'
                        : '—'
                    })()
                  : '—'}
              </strong>
              <span>đúng ở lượt đánh giá nghĩa</span>
            </div>
          </div>
          {session.status === 'completed' && data.attempts.isPending && (
            <LoadingState />
          )}
          {data.attempts.isError && (
            <ErrorState
              error={data.attempts.error}
              retry={() => void data.attempts.refetch()}
            />
          )}
          <div className="result-changes">
            {session.words.map((w) => {
              const attempts = data.attempts.data?.filter(
                (a) => a.sessionWordId === w.id && a.role === 'assessment' && !a.type.startsWith('listen')
              )
              const listening = data.attempts.data?.filter(
                (a) => a.sessionWordId === w.id && a.type.startsWith('listen')
              )
              return (
                <div key={w.id}>
                  <strong>{w.term}{w.meaningVi && ` · ${w.meaningVi}`}</strong>
                  <span>
                    {attempts
                      ? `${attempts.filter((a) => a.isCorrect).length}/${attempts.length} lượt đánh giá đúng`
                      : w.levelAtStart
                        ? `Level ${w.levelAtStart} lúc bắt đầu`
                        : 'Nghĩa mới'}
                  </span>
                  {!!listening?.length && <span>
                    {listening.filter(a => a.isCorrect).length}/{listening.length} câu nghe đúng
                  </span>}
                  {w.isLegacy && <WordHistory id={w.vocabularyId} />}
                </div>
              )
            })}
          </div>
          <p className="muted">
            {session.status === 'completed'
              ? 'Kết quả và lịch ôn đã lưu. Xem Level hiện tại trong Kho từ.'
              : 'Phiên bỏ dở không cập nhật Level hoặc lịch ôn.'}
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
        <>
          <div className="learning-header glass-control">
            {quit}
            <span>LÀM QUEN TỪ MỚI</span>
            <span>
              {session.words.filter((word) => word.levelAtStart === 0).length}{' '}
              từ
            </span>
          </div>
          <section className="new-word-intro">
            <span className="eyebrow">TRƯỚC KHI LUYỆN NHỚ</span>
            <h2>Làm quen từ mới</h2>
            <p>Xem nghĩa và ví dụ trước khi bắt đầu câu hỏi.</p>
            {intro.isPending ? (
              <LoadingState />
            ) : intro.isError ? (
              <ErrorState
                error={intro.error}
                retry={() => void intro.refetch()}
              />
            ) : (
              <div className="intro-list">
                {intro.data.length ? (
                  intro.data.map((w) => (
                    <article className="glass-panel" key={w.id}>
                      <h3>
                        {w.term} <small>{w.ipa}</small>
                      </h3>
                      <SpeakButton term={w.term} audioUrl={w.audioUrl} language={w.language} />
                      {w.meanings.map((m, i) => (
                        <div className="practice-meaning" key={m.id || i}>
                          <p>
                            {m.partOfSpeech && (
                              <small>{m.partOfSpeech} · </small>
                            )}
                            {m.meaningVi}
                          </p>
                          {m.examples.map((e, j) => (
                            <blockquote key={e.id || j}>
                              {e.sentenceEn}
                              {e.sentenceVi && <small>{e.sentenceVi}</small>}
                            </blockquote>
                          ))}
                        </div>
                      ))}
                    </article>
                  ))
                ) : (
                  <p>Phiên này chỉ gồm nghĩa đã học. Sẵn sàng ôn lại?</p>
                )}
              </div>
            )}
            <Button
              className="btn btn-primary"
              disabled={intro.isPending || intro.isError}
              onClick={() => setParams({ session: id, questions: '1' })}
            >
              Bắt đầu câu hỏi
            </Button>
          </section>
        </>
      )
    if (loadingQuestion) return <LoadingState />
    if (data.next.isError)
      return (
        <ErrorState
          error={data.next.error}
          retry={() =>
            void (data.feedback ? data.advance() : data.next.refetch())
          }
        />
      )
    if (!data.next.data)
      return (
        <div className="glass-panel result-page">
          {quit}
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
    const currentQuestion = session.answeredCount + 1
    const answered = session.answeredCount + (data.feedback ? 1 : 0)
    const total = Math.max(
      answered,
      session.answeredCount + session.remainingCount
    )
    return (
      <>
        <div className="learning-header glass-control">
          {quit}
          <Progress
            className="practice-progress"
            aria-label="Tiến độ phiên"
            value={answered}
            max={total || 1}
          />
          <span
            className="question-count"
            aria-label={`Câu ${Math.min(currentQuestion, total)} trên ${total}`}
          >
            {Math.min(currentQuestion, total)} <span>/ {total}</span>
          </span>
        </div>
        <QuestionForm
          key={q.id}
          question={q}
          ipa={session.words.find((w) => w.id === q.sessionWordId)?.ipa}
          pending={data.answer.isPending || data.skipAudio.isPending}
          onSkipAudio={() => data.skipAudio.mutate({ sessionId: id, questionId: q.id })}
          onAnswer={(answer) =>
            data.answer.mutate({ sessionId: id, questionId: q.id, answer })
          }
          feedback={data.feedback}
          onNext={() => void data.advance()}
          advancing={data.next.isFetching}
        />
      </>
    )
  }
  return (
    <>
      <div
        className={
          id && data.session.data?.status === 'in_progress'
            ? 'sr-only'
            : 'page-heading'
        }
      >
        <div>
          <h1>Luyện tập</h1>
          <p className="muted">Ôn nghĩa đến hạn và học nghĩa mới.</p>
        </div>
      </div>
      {content()}
      <AlertDialog open={confirmQuit} onOpenChange={setConfirmQuit}>
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            quitButton.current?.focus()
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Thoát phiên luyện tập?</AlertDialogTitle>
            <AlertDialogDescription>
              Kết quả dở dang không làm thay đổi Level hoặc lịch ôn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục học</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending || data.answer.isPending}
              onClick={() =>
                data.abandon.mutate(id, { onSuccess: () => setSession('') })
              }
            >
              Xác nhận thoát
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {data.session.data?.status === 'in_progress' &&
        questions &&
        (loadingQuestion || data.next.isError) &&
        quit}
    </>
  )
}
