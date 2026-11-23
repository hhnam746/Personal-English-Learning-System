import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useIsMutating } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Layers, Zap } from 'lucide-react'
import { FlashcardStudy } from '@/features/flashcards/components/flashcard-study'
import { MatchingGame } from '@/features/practice/components/matching-game'
import { useVocabularies } from '@/features/vocabularies/hooks/use-vocabularies'
import { useLanguageStore } from '@/lib/zustand/language.store'

export default function FlashcardsPage() {
  const [params, setParams] = useSearchParams()
  const initialMode = params.get('mode') === 'match' ? 'match' : 'flashcard'
  const [mode, setMode] = useState<'flashcard' | 'match'>(initialMode)
  const { currentLanguage } = useLanguageStore()
  const pending = useIsMutating({ mutationKey: ['flashcard-review'] }) > 0
  const filter = params.get('level') || ''
  const level = /^[0-5]$/.test(filter) ? Number(filter) : undefined

  const { data: vocabData } = useVocabularies({
    language: currentLanguage,
    pageSize: 50
  })

  return (
    <>
      <div className="page-heading flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1>Luyện ghi nhớ</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lật thẻ flashcard tự do hoặc thử thách tốc độ với trò chơi ghép thẻ
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab selector between Flashcard and Match Game */}
          <div className="flex p-1 rounded-xl bg-card/80 border border-border/60">
            <button
              type="button"
              onClick={() => {
                setMode('flashcard')
                setParams((prev) => {
                  const n = new URLSearchParams(prev)
                  n.delete('mode')
                  return n
                })
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'flashcard'
                  ? 'bg-[#FD5F01] text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Lật thẻ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('match')
                setParams((prev) => {
                  const n = new URLSearchParams(prev)
                  n.set('mode', 'match')
                  return n
                })
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'match'
                  ? 'bg-[#FD5F01] text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Ghép thẻ phản xạ
            </button>
          </div>

          {mode === 'flashcard' && (
            <Select
              disabled={pending}
              value={level === undefined ? 'all' : String(level)}
              onValueChange={(value) =>
                setParams(value === 'all' ? {} : { level: value })
              }
            >
              <SelectTrigger
                className="glass-control"
                aria-label="Lọc thẻ theo cấp độ"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectGroup>
                  <SelectItem value="all">Tất cả các từ</SelectItem>
                  {[0, 1, 2, 3, 4, 5].map((l) => (
                    <SelectItem value={String(l)} key={l}>
                      {l ? `Level ${l}` : 'Chưa học'}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {mode === 'flashcard' ? (
        <FlashcardStudy key={level ?? 'all'} level={level} />
      ) : (
        <MatchingGame vocabularies={vocabData?.items || []} />
      )}

      <div className="mt-6 flex items-center justify-between">
        <Link className="text-link text-xs" to="/library">
          ← Mở Kho từ vựng
        </Link>
        <Link className="text-link text-xs" to="/practice">
          Vào phiên luyện tập chính (SRS) →
        </Link>
      </div>
    </>
  )
}

