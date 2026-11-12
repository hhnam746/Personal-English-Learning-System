import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpeakButton } from '@/components/speak-button'
import { LoadingState, ErrorState } from '@/components/query-state'
import { useVocabularies } from '@/features/vocabularies/hooks/use-vocabularies'
import { useWordDialog } from '@/features/vocabularies/hooks/use-word-dialog'
export default function LibraryPage() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])
  const [params, setParams] = useSearchParams()
  const dialog = useWordDialog()
  const filter = params.get('filter') || ''
  const search = params.get('search') || ''
  const sort = params.get('sort') || 'recent'
  const page = Math.min(100000, Math.max(1, Number(params.get('page')) || 1))
  const level = /^[0-5]$/.test(filter) ? Number(filter) : undefined
  const query = useVocabularies({
    search,
    level,
    dueOnly: filter === 'due',
    sort: ['recent', 'alpha', 'level'].includes(sort) ? sort : 'recent',
    page,
    pageSize: 20
  })
  const set = (name: string, value: string) => {
    const next = new URLSearchParams(params)
    next.delete('page')
    if (value) next.set(name, value)
    else next.delete(name)
    setParams(next, { replace: name === 'search' })
  }
  useEffect(() => {
    if (
      query.data &&
      !query.isPlaceholderData &&
      page > Math.max(1, Math.ceil(query.data.totalItems / 20))
    ) {
      const next = new URLSearchParams(params)
      next.set(
        'page',
        String(Math.max(1, Math.ceil(query.data.totalItems / 20)))
      )
      setParams(next, { replace: true })
    }
  }, [query.data, query.isPlaceholderData, page, params, setParams])
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Kho từ vựng</h1>
          <p>Thêm, tìm kiếm và chỉnh sửa từ đã lưu.</p>
        </div>
        <div className="heading-count">
          {query.data?.totalItems ?? '—'}
          <span>từ phù hợp</span>
        </div>
      </div>
      <div className="library-tools">
        <label className="search-input glass-control">
          <Search className="icon" />
          <input
            aria-label="Tìm từ hoặc nghĩa tiếng Việt"
            type="search"
            value={search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Tìm từ hoặc nghĩa tiếng Việt…"
          />
        </label>
        <select
          className="glass-control"
          aria-label="Sắp xếp từ"
          value={sort}
          onChange={(e) => set('sort', e.target.value)}
        >
          <option value="recent">Mới thêm gần đây</option>
          <option value="alpha">Từ A đến Z</option>
          <option value="level">Cấp độ tăng dần</option>
        </select>
      </div>
      <div className="filter-tabs glass-segmented" aria-label="Lọc theo cấp độ">
        {[
          ['', 'Tất cả'],
          ['due', 'Đến hạn'],
          ['0', 'Chưa học'],
          ...[1, 2, 3, 4, 5].map((l) => [String(l), `Level ${l}`])
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            className={filter === value ? 'selected' : ''}
            onClick={() => set('filter', value)}
          >
            {label}
          </button>
        ))}
      </div>
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <div aria-busy={query.isFetching}>
          {query.data.items.length ? (
            <div className="table-container glass-panel">
              <table className="word-table">
                <thead>
                  <tr>
                    <th>Từ vựng / Phát âm</th>
                    <th>Nghĩa tiếng Việt</th>
                    <th>Ghi nhớ</th>
                    <th>Lịch ôn</th>
                    <th>
                      <span className="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((word) => (
                    <tr key={word.id}>
                      <td>
                        <div className="table-word">
                          <button onClick={() => dialog.openDetail(word.id)}>
                            <strong>{word.term}</strong>
                            <span>{word.ipa || 'Chưa có IPA'}</span>
                          </button>
                          <SpeakButton
                            term={word.term}
                            audioUrl={word.audioUrl}
                          />
                        </div>
                      </td>
                      <td className="meaning-cell">
                        {word.meanings.map((m) => m.meaningVi).join('; ')}
                      </td>
                      <td>
                        <span className={`level-tag level-${word.level}`}>
                          {word.level ? `Level ${word.level}` : 'Chưa học'}
                        </span>
                      </td>
                      <td>
                        <span className="due-label">
                          {word.isSuspended
                            ? 'Tạm dừng'
                            : !word.level
                              ? 'Chờ học lần đầu'
                              : word.nextReviewAt
                                ? Date.parse(word.nextReviewAt) <= now
                                  ? 'Đến hạn ôn'
                                  : new Date(word.nextReviewAt).toLocaleString(
                                      'vi-VN'
                                    )
                                : 'Chưa có lịch'}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Button
                            variant="ghost"
                            className="icon-button"
                            aria-label={`Sửa ${word.term}`}
                            onClick={() => dialog.openEdit(word.id)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            className="icon-button"
                            aria-label={`Xóa ${word.term}`}
                            onClick={() => dialog.openDelete(word.id)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state glass-panel">
              <h2>Không có từ phù hợp.</h2>
              <p>Thử bộ lọc khác hoặc lưu một từ mới.</p>
              <Button className="btn btn-primary" onClick={dialog.openCreate}>
                Thêm từ mới
              </Button>
            </div>
          )}
          <div className="list-footer">
            <span>
              {query.isFetching
                ? 'Đang cập nhật…'
                : `${query.data.totalItems} từ · Trang ${page}`}
            </span>
            <div className="pagination">
              <Button
                variant="outline"
                disabled={page === 1 || query.isPlaceholderData}
                onClick={() =>
                  setParams((p) => {
                    const n = new URLSearchParams(p)
                    n.set('page', String(page - 1))
                    return n
                  })
                }
              >
                Trước
              </Button>
              <Button
                variant="outline"
                disabled={
                  page * 20 >= query.data.totalItems || query.isPlaceholderData
                }
                onClick={() =>
                  setParams((p) => {
                    const n = new URLSearchParams(p)
                    n.set('page', String(page + 1))
                    return n
                  })
                }
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
