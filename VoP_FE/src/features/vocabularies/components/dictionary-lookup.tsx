import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Combobox,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/components/ui/combobox'
import type { VocabularyInput } from '../types'
import vocabularyService from '../services'
import { partOfSpeechLabel } from '../part-of-speech'
import { apiError } from '@/shared/api-error'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useWordDialog } from '../hooks/use-word-dialog'

interface Suggestion {
  id: number
  term: string
  ipa: string | null
  region: string | null
  partsOfSpeech: string[]
  meaningPreview: string | null
}

interface Entry {
  word: Suggestion
  meanings: {
    definitionId: number
    meaningVi: string
    partOfSpeech: string | null
    examples: string[]
  }[]
}

const parts: Record<string, string> = {
  N: 'noun',
  n: 'noun',
  V: 'verb',
  A: 'adjective',
  adj: 'adjective',
  D: 'adverb',
  adv: 'adverb',
  idiom: 'phrase'
}

export function DictionaryLookup({
  initialTerm = '',
  onChoose,
  onManual,
  onDirtyChange
}: {
  initialTerm?: string
  onChoose: (draft: VocabularyInput) => void
  onManual: (term: string) => void
  onDirtyChange: (dirty: boolean) => void
}) {
  const dialog = useWordDialog()
  const client = useQueryClient()
  const [linkId, setLinkId] = useState('')
  const [text, setText] = useState(initialTerm)
  const [query, setQuery] = useState('')
  const [word, setWord] = useState<Suggestion | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(text.trim()), 180)
    return () => window.clearTimeout(timer)
  }, [text])
  const search = useQuery({
    queryKey: ['dictionary', 'search', query],
    enabled: query.length > 0 && !word,
    queryFn: async ({ signal }) =>
      (
        await api.get<Suggestion[]>('/dictionary/entries', {
          params: { q: query },
          signal
        })
      ).data,
    retry: false
  })
  const detail = useQuery({
    queryKey: ['dictionary', 'entry', word?.id],
    enabled: !!word,
    queryFn: async ({ signal }) =>
      (await api.get<Entry>(`/dictionary/entries/${word?.id}`, { signal })).data
  })
  const personal = useQuery({
    queryKey: ['vocabularies', 'dictionary-match', word?.term],
    enabled: !!word,
    queryFn: async ({ signal }) => {
      const results = await vocabularyService.list(
        {
          exactTerm: word!.term,
          pageSize: 1
        },
        signal
      )
      return results.items[0] ?? null
    }
  })
  const link = useMutation({
    mutationFn: async ({
      id,
      meaningId,
      entryId,
      definitionId
    }: {
      id: string
      meaningId: string
      entryId: number
      definitionId: number
    }) => {
      await api.patch(
        `/vocabularies/${id}/meanings/${meaningId}/dictionary-source`,
        { entryId, definitionId }
      )
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['vocabularies'] })
      setLinkId('')
      setSelected([])
    }
  })
  useEffect(() => {
    onDirtyChange(selected.length > 0 || link.isPending)
    return () => onDirtyChange(false)
  }, [selected.length, link.isPending, onDirtyChange])
  const saved = personal.data
  const term = text.trim()
  const suggestions = !word && term && query === term ? (search.data ?? []) : []
  return (
    <div className="word-form-main">
      <Combobox
        inline
        open
        items={suggestions}
        value={word}
        inputValue={word?.term ?? text}
        filter={null}
        itemToStringLabel={(item: Suggestion) => item.term}
        isItemEqualToValue={(a: Suggestion, b: Suggestion) => a.id === b.id}
        onValueChange={(item: Suggestion | null) => {
          setWord(item)
          setSelected([])
          setLinkId('')
        }}
      >
        <ComboboxInput
          id="term"
          aria-label="Tra từ tiếng Anh"
          className="glass-control"
          placeholder="Ví dụ: resilient"
          maxLength={255}
          showTrigger={false}
          onChange={(event) => {
            setText(event.currentTarget.value)
            setWord(null)
            setSelected([])
          }}
        />
        {!word && (
          <div className="glass-inset h-56">
            {suggestions.length > 0 ? (
              <ComboboxList className="h-full max-h-none overflow-y-auto p-1">
                {(item: Suggestion) => {
                  const labels = [
                    ...new Set(
                      item.partsOfSpeech.map((part) =>
                        partOfSpeechLabel(parts[part] ?? part)
                      )
                    )
                  ]
                  return (
                    <ComboboxItem
                      key={item.id}
                      value={item}
                      className="grid items-start gap-x-4 gap-y-1 px-3 py-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
                    >
                      <span className="min-w-0">
                        <strong className="block break-words font-semibold">
                          {item.term}
                        </strong>
                        {(item.ipa || labels.length > 0) && (
                          <span className="muted flex flex-wrap gap-x-2 text-xs">
                            {item.ipa && <span>{item.ipa}</span>}
                            {labels.length > 0 && (
                              <span>{labels.join(', ')}</span>
                            )}
                          </span>
                        )}
                      </span>
                      {item.meaningPreview && (
                        <span className="line-clamp-2 break-words">
                          {item.meaningPreview}
                        </span>
                      )}
                    </ComboboxItem>
                  )
                }}
              </ComboboxList>
            ) : (
              <p
                className="muted grid h-full place-items-center px-4 py-3 text-center"
                role={
                  term && query === term && search.isError ? 'alert' : 'status'
                }
              >
                {!term
                  ? 'Chưa nhập từ'
                  : query !== term || search.isPending || search.isFetching
                    ? 'Đang tra từ…'
                    : search.isError
                      ? 'Không tra được từ điển. Bạn có thể nhập thủ công.'
                      : 'Không tìm thấy từ'}
              </p>
            )}
          </div>
        )}
      </Combobox>
      {word && detail.isPending && <p role="status">Đang tải nghĩa…</p>}
      {word && detail.isError && (
        <p role="alert">Không tải được nghĩa. Bạn có thể nhập thủ công.</p>
      )}
      {word && detail.data && (
        <fieldset className="word-form-main">
          <legend>Chọn nghĩa muốn học</legend>
          {word.ipa && <p className="muted">{word.ipa}</p>}
          {[...detail.data.meanings]
            .sort((a, b) =>
              (a.partOfSpeech ?? '').localeCompare(b.partOfSpeech ?? '')
            )
            .map((sense) => {
              const isSelected = selected.includes(sense.definitionId)
              const alreadySaved = saved?.meanings.some(
                (m) =>
                  m.dictionaryEntryId === word.id &&
                  m.dictionaryDefinitionId === sense.definitionId
              )
              return (
                <label
                  key={sense.definitionId}
                  className="glass-inset flex items-start gap-3 p-3"
                  data-selected={isSelected}
                >
                  <Checkbox
                    checked={alreadySaved === true || isSelected}
                    disabled={
                      alreadySaved ||
                      link.isPending ||
                      (selected.length >= 30 && !isSelected)
                    }
                    onCheckedChange={(checked) =>
                      setSelected((ids) =>
                        checked === true
                          ? [...ids, sense.definitionId]
                          : ids.filter((id) => id !== sense.definitionId)
                      )
                    }
                  />
                  <span>
                    {sense.meaningVi}
                    {alreadySaved && (
                      <small className="muted block">Đã lưu</small>
                    )}
                    {sense.partOfSpeech && (
                      <small className="muted block">
                        {partOfSpeechLabel(
                          parts[sense.partOfSpeech] ?? sense.partOfSpeech
                        )}
                      </small>
                    )}
                    {sense.examples[0] && (
                      <small className="muted block">{sense.examples[0]}</small>
                    )}
                  </span>
                </label>
              )
            })}
        </fieldset>
      )}
      {saved && (
        <div className="word-form-main">
          <Button
            type="button"
            className="btn btn-secondary"
            disabled={selected.length > 0 || link.isPending}
            onClick={() => dialog.openEdit(saved.id)}
          >
            Sửa từ đã lưu
          </Button>
          {word &&
            selected.length === 1 &&
            saved.meanings.some((m) => !m.dictionaryEntryId) && (
              <>
                <Select
                  value={linkId}
                  onValueChange={setLinkId}
                  disabled={link.isPending}
                >
                  <SelectTrigger
                    className="glass-control"
                    aria-label="Chọn nghĩa cá nhân để liên kết"
                  >
                    <SelectValue placeholder="Chọn nghĩa cá nhân để liên kết" />
                  </SelectTrigger>
                  <SelectContent>
                    {saved.meanings
                      .filter((m) => m.id && !m.dictionaryEntryId)
                      .map((m) => (
                        <SelectItem key={m.id} value={m.id!}>
                          {m.meaningVi}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!linkId || link.isPending}
                  onClick={() =>
                    link.mutate({
                      id: saved.id,
                      meaningId: linkId,
                      entryId: word.id,
                      definitionId: selected[0]
                    })
                  }
                >
                  Liên kết nghĩa đã chọn với nguồn từ điển
                </Button>
                {link.isError && <p role="alert">{apiError(link.error)}</p>}
              </>
            )}
        </div>
      )}
      <div className="form-actions">
        <Button
          type="button"
          className="btn btn-secondary"
          disabled={link.isPending || selected.length > 0}
          onClick={() => onManual(word?.term ?? text)}
        >
          Nhập thủ công
        </Button>
        {word && detail.data && (
          <Button
            type="button"
            className="btn btn-primary"
            disabled={!selected.length || link.isPending}
            onClick={() =>
              onChoose({
                term: word.term,
                ipa: word.ipa,
                audioUrl: null,
                meanings: detail.data.meanings
                  .filter((s) => selected.includes(s.definitionId))
                  .map((sense) => ({
                    dictionaryEntryId: word.id,
                    dictionaryDefinitionId: sense.definitionId,
                    meaningVi: sense.meaningVi,
                    partOfSpeech: sense.partOfSpeech
                      ? (parts[sense.partOfSpeech] ?? sense.partOfSpeech)
                      : null,
                    ipaOverride: null,
                    examples: sense.examples.map((sentenceEn) => ({
                      sentenceEn,
                      sentenceVi: null,
                      clozeSentenceEn: null,
                      clozeAnswer: null
                    }))
                  }))
              })
            }
          >
            Chỉnh sửa trước khi lưu
          </Button>
        )}
      </div>
    </div>
  )
}
