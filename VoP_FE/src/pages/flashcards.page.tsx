import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFlashcards } from '@/features/flashcards/hooks/use-flashcards'
import { Button } from '@/components/ui/button'
import { SpeakButton } from '@/components/speak-button'
import { LoadingState, ErrorState } from '@/components/query-state'
function Card({
  word,
  pending,
  onRate
}: {
  word: import('@/features/vocabularies/types').Vocabulary
  pending: boolean
  onRate: (rating: 'remembered' | 'forgotten') => void
}) {
  const [flipped, setFlipped] = useState(false)
  return (
    <section className="glass-panel flashcard-study">
      <h2>{word.term}</h2>
      <p>{word.ipa}</p>
      <SpeakButton term={word.term} audioUrl={word.audioUrl} />
      <Button
        className="btn btn-secondary"
        onClick={() => setFlipped((v) => !v)}
      >
        {flipped ? 'Xem mặt trước' : 'Lật thẻ'}
      </Button>
      {flipped && (
        <>
          <div>
            {word.meanings.map((m, i) => (
              <p key={i}>{m.meaningVi}</p>
            ))}
          </div>
          <div className="form-actions">
            <Button disabled={pending} onClick={() => onRate('forgotten')}>
              Chưa nhớ
            </Button>
            <Button disabled={pending} onClick={() => onRate('remembered')}>
              Nhớ
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
export default function FlashcardsPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Math.min(100000, Number(params.get('page')) || 1))
  const { query, rate } = useFlashcards(page)
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Flashcard</h1>
          <p>Ôn tự do, không thay đổi Level hoặc lịch ôn.</p>
        </div>
      </div>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : query.data.items[0] ? (
        <>
          <Card
            key={query.data.items[0].id}
            word={query.data.items[0]}
            pending={rate.isPending}
            onRate={(rating) =>
              rate.mutate(
                { id: query.data.items[0].id, rating },
                {
                  onSuccess: () => {
                    if (page < query.data.totalItems)
                      setParams({ page: String(page + 1) })
                  }
                }
              )
            }
          />
          <div className="form-actions">
            <Button
              variant="outline"
              disabled={page === 1 || rate.isPending}
              onClick={() => setParams({ page: String(page - 1) })}
            >
              Thẻ trước
            </Button>
            <span>
              {page} / {query.data.totalItems}
            </span>
            <Button
              variant="outline"
              disabled={page >= query.data.totalItems || rate.isPending}
              onClick={() => setParams({ page: String(page + 1) })}
            >
              Thẻ sau
            </Button>
          </div>
        </>
      ) : (
        <p className="glass-panel">
          Không có thẻ ở trang này. Thêm từ hoặc quay lại thẻ trước.
        </p>
      )}
    </>
  )
}
