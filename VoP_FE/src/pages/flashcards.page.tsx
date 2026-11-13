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
import { FlashcardStudy } from '@/features/flashcards/components/flashcard-study'
export default function FlashcardsPage() {
  const pending = useIsMutating({ mutationKey: ['flashcard-review'] }) > 0
  const [params, setParams] = useSearchParams()
  const filter = params.get('level') || ''
  const level = /^[0-5]$/.test(filter) ? Number(filter) : undefined
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Flashcard</h1>
          <p>Lật thẻ để xem nghĩa và tự đánh giá.</p>
        </div>
        <Select
          disabled={pending}
          value={level === undefined ? 'all' : String(level)}
          onValueChange={(value) =>
            setParams(value === 'all' ? {} : { level: value })
          }
        >
          <SelectTrigger
            className="flashcard-level-trigger glass-control"
            aria-label="Lọc thẻ theo cấp độ"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            className="flashcard-level-menu"
            position="popper"
            align="end"
          >
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
      </div>
      <FlashcardStudy key={level ?? 'all'} level={level} />
      <Link className="text-link" to="/library">
        Mở Kho từ vựng
      </Link>
    </>
  )
}
