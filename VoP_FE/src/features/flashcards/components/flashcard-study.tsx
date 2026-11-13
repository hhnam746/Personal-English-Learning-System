import { useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw, Check, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpeakButton } from '@/components/speak-button'
import { LoadingState, ErrorState } from '@/components/query-state'
import { useFlashcards } from '../hooks/use-flashcards'
import type { Rating } from '../services'
import type { Vocabulary } from '@/features/vocabularies/types'

function Card({
  word,
  pending,
  onRate
}: {
  word: Vocabulary
  pending: boolean
  onRate: (rating: Rating) => void
}) {
  const [flipped, setFlipped] = useState(false)
  const contentId = useId()
  const meanings = useRef<HTMLSpanElement>(null)
  return (
    <>
      <div className="flash-bezel">
        <Button
          variant="ghost"
          type="button"
          className={`flashcard ${flipped ? 'flipped' : ''}`}
          disabled={pending}
          aria-label={flipped ? 'Lật về mặt từ' : 'Lật thẻ xem nghĩa'}
          aria-pressed={flipped}
          aria-describedby={contentId}
          onClick={() => setFlipped(!flipped)}
          onKeyDown={(event) => {
            const content = meanings.current
            if (
              !flipped ||
              !content ||
              content.scrollHeight <= content.clientHeight
            )
              return
            if (event.key === 'Home' || event.key === 'End') {
              event.preventDefault()
              content.scrollTop =
                event.key === 'Home' ? 0 : content.scrollHeight
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault()
              content.scrollBy(0, event.key === 'ArrowUp' ? -40 : 40)
            }
          }}
        >
          <span
            className="flash-face flash-front glass-panel"
            aria-hidden={flipped}
          >
            <span className="eyebrow">THỬ NHỚ NGHĨA CỦA TỪ</span>
            <strong id={flipped ? undefined : contentId}>{word.term}</strong>
            <span className="flash-ipa">{word.ipa || 'Chưa có IPA'}</span>
            <span className="flip-prompt">
              <RotateCcw className="icon" aria-hidden="true" />
              Chạm hoặc nhấn Space để lật thẻ
            </span>
          </span>
          <span
            className="flash-face flash-back glass-panel glass-panel--peach"
            aria-hidden={!flipped}
          >
            <span className="eyebrow">{word.term}</span>
            <span
              className="flash-meanings"
              ref={meanings}
              id={flipped ? contentId : undefined}
            >
              {word.meanings.map((m, i) => (
                <span className="flash-meaning" key={m.id || i}>
                  <strong>{m.meaningVi}</strong>
                  {(m.partOfSpeech || m.ipaOverride) && (
                    <small>
                      {m.partOfSpeech} {m.ipaOverride}
                    </small>
                  )}
                  {m.examples.map((e, j) => (
                    <span className="flash-example" key={e.id || j}>
                      {e.sentenceEn}
                      {e.sentenceVi && <small>{e.sentenceVi}</small>}
                    </span>
                  ))}
                </span>
              ))}
            </span>
            <span className="flip-prompt">
              <RotateCcw className="icon" aria-hidden="true" /> Lật về mặt từ
            </span>
          </span>
        </Button>
      </div>
      <div className="flash-pronounce">
        <SpeakButton
          term={word.term}
          audioUrl={word.audioUrl}
          text="Nghe phát âm"
        />
      </div>
      <div className={flipped ? 'flash-self' : 'flash-self invisible'}>
        <Button
          className="btn btn-secondary"
          disabled={pending}
          onClick={() => onRate('forgotten')}
        >
          <RotateCcw className="icon" />
          Chưa nhớ
        </Button>
        <Button
          className="btn btn-primary"
          disabled={pending}
          onClick={() => onRate('remembered')}
        >
          Đã nhớ
          <span className="btn-icon">
            <Check className="icon" aria-hidden="true" />
          </span>
        </Button>
      </div>
    </>
  )
}
export function FlashcardStudy({ level }: { level?: number }) {
  const [page, setPage] = useState(1)
  const [finished, setFinished] = useState(false)
  const [ratings, setRatings] = useState<Record<string, Rating>>({})
  const sending = useRef(false)
  const { query, rate } = useFlashcards(page, level)
  const word = query.data?.items[0]
  const total = query.data?.totalItems || 0
  const move = (delta: number) => {
    if (!sending.current) setPage(Math.max(1, Math.min(total, page + delta)))
  }
  if (finished)
    return (
      <section className="result-page glass-panel">
        <div className="result-emblem">
          <Layers className="icon" aria-hidden="true" />
        </div>
        <h2>Đã kết thúc lượt ôn</h2>
        <p>Kết quả tự đánh giá trong lượt ôn này.</p>
        <div className="result-metrics glass-inset">
          <div>
            <strong>
              {Object.values(ratings).filter((r) => r === 'remembered').length}
            </strong>
            <span>thẻ đã nhớ</span>
          </div>
          <div>
            <strong>
              {Object.values(ratings).filter((r) => r === 'forgotten').length}
            </strong>
            <span>thẻ chưa nhớ</span>
          </div>
          <div>
            <strong>{Math.max(0, total - Object.keys(ratings).length)}</strong>
            <span>thẻ chưa đánh giá</span>
          </div>
        </div>
        <Button
          className="btn btn-primary"
          onClick={() => {
            setPage(1)
            setRatings({})
            setFinished(false)
          }}
        >
          Ôn lại bộ thẻ
        </Button>
        <p className="proposal-caption">
          Level và lịch ôn được giữ nguyên. Tải lại trang bắt đầu lượt ôn mới;
          các đánh giá đã gửi vẫn được lưu.
        </p>
      </section>
    )
  return (
    <div
      className="flashcard-workspace"
      onKeyDown={(e) => {
        if (
          e.altKey ||
          e.ctrlKey ||
          e.metaKey ||
          e.target instanceof HTMLSelectElement
        )
          return
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault()
          move(e.key === 'ArrowLeft' ? -1 : 1)
        }
      }}
    >
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : word ? (
        <>
          <div className="flash-top">
            <span aria-live="polite">
              {String(page).padStart(2, '0')}{' '}
              <span className="muted">/ {total}</span>
            </span>
            <span className={`level-tag level-${word.level}`}>
              <span />
              {word.level ? `Level ${word.level}` : 'Chưa học'}
            </span>
          </div>
          <Card
            key={word.id}
            word={word}
            pending={rate.isPending}
            onRate={(rating) => {
              if (sending.current) return
              sending.current = true
              rate.mutate(
                { id: word.id, rating },
                {
                  onSuccess: () => {
                    setRatings((old) => ({ ...old, [word.id]: rating }))
                    if (page < total) setPage(page + 1)
                    else setFinished(true)
                  },
                  onSettled: () => {
                    sending.current = false
                  }
                }
              )
            }}
          />
          <div className="flash-controls">
            <Button
              variant="ghost"
              className="icon-button"
              aria-label="Thẻ trước"
              disabled={page === 1 || rate.isPending}
              onClick={() => move(-1)}
            >
              <ArrowLeft className="icon" />
            </Button>
            <div className="flash-dots" aria-hidden="true">
              {Array.from(
                {
                  length: Math.min(total, page + 3) - Math.max(1, page - 3) + 1
                },
                (_, i) => {
                  const position = Math.max(1, page - 3) + i
                  return (
                    <i
                      key={position}
                      className={position === page ? 'active' : undefined}
                    />
                  )
                }
              )}
            </div>
            <Button
              variant="ghost"
              className="icon-button"
              aria-label="Thẻ tiếp theo"
              disabled={page === total || rate.isPending}
              onClick={() => move(1)}
            >
              <ArrowRight className="icon" />
            </Button>
          </div>
          <div className="form-actions">
            <Button
              className="btn btn-secondary"
              disabled={rate.isPending}
              onClick={() => setFinished(true)}
            >
              Kết thúc lượt ôn
            </Button>
          </div>
        </>
      ) : (
        <section className="empty-state glass-panel">
          <h2>{total ? 'Bộ thẻ đã thay đổi' : 'Chưa có thẻ ở cấp độ này'}</h2>
          <p>Chọn cấp độ khác hoặc thêm từ vào Kho từ vựng.</p>
          {page > 1 && <Button onClick={() => setPage(1)}>Về thẻ đầu</Button>}
        </section>
      )}
      <p className="proposal-caption">
        Flashcard ôn tự do, không thay đổi Level hoặc lịch ôn. Dùng ← / → để
        chuyển thẻ; thẻ bỏ qua không được tự đánh giá.
      </p>
    </div>
  )
}
