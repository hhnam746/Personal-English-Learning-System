import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useBlocker, useBeforeUnload } from 'react-router-dom'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState } from '@/components/query-state'
import { SpeakButton } from '@/components/speak-button'
import { useWordDialog } from '../hooks/use-word-dialog'
import { useVocabulary } from '../hooks/use-vocabularies'
import { useVocabularyMutations } from '../hooks/use-vocabulary-mutations'
import { WordHistory } from './word-history'
import { DictionaryLookup } from './dictionary-lookup'
import type { VocabularyInput } from '../types'
import { VocabularyForm } from './vocabulary-form'

export function VocabularyDialog() {
  const dialog = useWordDialog()
  const opener = useRef(
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  )
  const discardOpener = useRef<HTMLElement | null>(null)
  const dirty = useRef(false)
  const [draft, setDraft] = useState<VocabularyInput | null>(null)
  const [lookupTerm, setLookupTerm] = useState('')
  const [discard, setDiscard] = useState<'close' | 'lookup' | null>(null)
  const setDirty = useCallback((value: boolean) => {
    dirty.current = value
  }, [])
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty.current &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search)
  )
  useBeforeUnload(
    useCallback((event) => {
      if (dirty.current) {
        event.preventDefault()
        event.returnValue = ''
      }
    }, [])
  )
  const query = useVocabulary(
    dialog.deleteId || dialog.editId || dialog.detailId
  )
  const { save, remove } = useVocabularyMutations()
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (save.isPending || remove.isPending) {
      blocker.reset()
      return
    }
  }, [blocker, save.isPending, remove.isPending])
  const word = query.data
  const editing = dialog.create || !!dialog.editId
  const open = editing || !!dialog.detailId
  const leaveForm = (destination: 'close' | 'lookup') => {
    dirty.current = false
    setDraft(null)
    setLookupTerm(destination === 'lookup' ? (draft?.term ?? '') : '')
    if (destination === 'close') dialog.close()
    else requestAnimationFrame(() => document.getElementById('term')?.focus())
  }
  const requestLeave = (destination: 'close' | 'lookup') => {
    if (!save.isPending && !remove.isPending) {
      if (dirty.current) {
        discardOpener.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null
        setDiscard(destination)
        return
      }
      leaveForm(destination)
    }
  }
  return (
    <>
      <AlertDialog
        open={
          discard !== null ||
          (blocker.state === 'blocked' && !save.isPending && !remove.isPending)
        }
        onOpenChange={(value) => {
          if (!value) {
            setDiscard(null)
            if (dirty.current && blocker.state === 'blocked') blocker.reset()
          }
        }}
      >
        <AlertDialogContent
          className="vop-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (dirty.current) {
              const form = document.querySelector(
                '[data-slot="dialog-content"]'
              )
              const target = discardOpener.current
              if (target?.isConnected && form?.contains(target)) target.focus()
              else form?.querySelector<HTMLElement>('input,button')?.focus()
            }
          }}
        >
          <AlertDialogTitle>Bỏ thay đổi chưa lưu?</AlertDialogTitle>
          <AlertDialogDescription>
            Nội dung chưa lưu sẽ bị mất. Bạn có thể quay lại để tiếp tục chỉnh
            sửa.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn btn-secondary">
              Tiếp tục chỉnh sửa
            </AlertDialogCancel>
            <Button
              className="btn btn-danger"
              onClick={() => {
                dirty.current = false
                setDiscard(null)
                if (blocker.state === 'blocked') {
                  setDraft(null)
                  setLookupTerm('')
                  blocker.proceed()
                } else leaveForm(discard ?? 'close')
              }}
            >
              Bỏ thay đổi
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) requestLeave('close')
        }}
      >
        <DialogContent
          className={editing ? 'vop-dialog word-form-dialog' : 'vop-dialog'}
          staticContent={editing}
          showCloseButton={!editing}
          onOpenAutoFocus={(event) => {
            if (
              !dialog.create ||
              window.matchMedia('(pointer: coarse)').matches
            )
              return
            const term = document.getElementById('term')
            if (term) {
              event.preventDefault()
              term.focus({ preventScroll: true })
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (opener.current?.isConnected) opener.current.focus()
            else document.querySelector<HTMLElement>('#main')?.focus()
          }}
        >
          <div className={editing ? 'word-form-scroll' : 'contents'}>
            {editing ? (
              <div className="modal-header">
                <DialogTitle>
                  {dialog.create ? 'Lưu một từ mới.' : 'Chỉnh sửa từ vựng'}
                </DialogTitle>
                <DialogClose
                  className="icon-button"
                  aria-label="Đóng hộp thoại"
                  disabled={save.isPending}
                >
                  <X className="icon" aria-hidden="true" />
                </DialogClose>
              </div>
            ) : (
              <DialogTitle>{word?.term || 'Chi tiết từ vựng'}</DialogTitle>
            )}
            <DialogDescription
              className={editing ? 'modal-description' : undefined}
            >
              {editing
                ? dialog.create
                  ? draft
                    ? 'Kiểm tra nghĩa trước khi lưu.'
                    : 'Tra từ tiếng Anh hoặc nhập thủ công.'
                  : 'Cập nhật nội dung, giữ lại tiến độ ghi nhớ.'
                : 'Nghĩa, phát âm và ví dụ của từ đã lưu.'}
            </DialogDescription>
            {dialog.create && draft && !draft.meanings.length && (
              <Button
                type="button"
                variant="ghost"
                className="text-link mb-4"
                disabled={save.isPending}
                onClick={() => requestLeave('lookup')}
              >
                <ArrowLeft className="icon" aria-hidden="true" />
                Quay lại tra từ
              </Button>
            )}
            {!dialog.create && query.isPending ? (
              <LoadingState />
            ) : !dialog.create && query.isError ? (
              <ErrorState
                error={query.error}
                retry={() => void query.refetch()}
              />
            ) : dialog.create && !draft ? (
              <DictionaryLookup
                initialTerm={lookupTerm}
                onChoose={setDraft}
                onDirtyChange={setDirty}
                onManual={(term) =>
                  setDraft({ term, ipa: null, audioUrl: null, meanings: [] })
                }
              />
            ) : editing ? (
              <VocabularyForm
                key={dialog.editId || 'new'}
                initial={dialog.create ? (draft ?? undefined) : undefined}
                word={dialog.editId ? word : undefined}
                pending={save.isPending}
                onDirtyChange={setDirty}
                onSave={async (data) => {
                  await save.mutateAsync({
                    id: dialog.editId || undefined,
                    data,
                    append: dialog.create && !!draft?.meanings.length
                  })
                  leaveForm('close')
                }}
              />
            ) : (
              word && (
                <div className="word-detail">
                  <div className="detail-title">
                    <span>{word.ipa || 'Chưa có IPA'}</span>
                    <SpeakButton term={word.term} audioUrl={word.audioUrl} language={word.language} />
                  </div>
                  {word.imageUrl && (
                    <div className="my-3 flex justify-center rounded-2xl overflow-hidden border border-border/60 bg-muted/20 p-2 shadow-sm">
                      <img
                        src={word.imageUrl}
                        alt={word.term}
                        className="max-h-48 w-auto rounded-xl object-contain shadow-md"
                        loading="lazy"
                      />
                    </div>
                  )}
                  {word.meanings.map((m, i) => (
                    <section key={m.id || i}>
                      <h3>{m.meaningVi}</h3>
                      <span className={`level-tag level-${m.level ?? 0}`}>
                        {m.level ? `Level ${m.level}` : 'Chưa học'}
                      </span>
                      <p className="muted">
                        {m.partOfSpeech} {m.ipaOverride}
                      </p>
                      {m.examples.map((e, n) => (
                        <blockquote key={e.id || n}>
                          {e.sentenceEn}
                          {e.sentenceVi && <small>{e.sentenceVi}</small>}
                        </blockquote>
                      ))}
                    </section>
                  ))}
                  <p className="muted">
                    {word.isSuspended
                      ? 'Đang tạm dừng ôn'
                      : word.nextReviewAt
                        ? `Lịch ôn: ${new Date(word.nextReviewAt).toLocaleString('vi-VN')}`
                        : 'Chưa bắt đầu học'}
                  </p>
                  <WordHistory key={word.id} id={word.id} />
                  <div className="form-actions">
                    <Button
                      className="btn btn-danger"
                      onClick={() => dialog.openDelete(word.id)}
                    >
                      Xóa từ
                    </Button>
                    <Button
                      className="btn btn-primary"
                      onClick={() => dialog.openEdit(word.id)}
                    >
                      Sửa từ
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!dialog.deleteId}
        onOpenChange={(v) => {
          if (!v && !remove.isPending) dialog.cancelDelete()
        }}
      >
        <AlertDialogContent
          className="vop-dialog glass-panel--dialog"
          onCloseAutoFocus={(event) => {
            if (dialog.detailId) return
            event.preventDefault()
            if (opener.current?.isConnected) opener.current.focus()
            else document.querySelector<HTMLElement>('#main')?.focus()
          }}
        >
          <AlertDialogTitle>
            {word ? `Xóa “${word.term}”?` : 'Xóa từ vựng?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {query.isError
              ? 'Không tải được từ vựng.'
              : 'Từ bị loại khỏi kho. Lịch sử học đã ghi nhận vẫn được giữ lại.'}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="btn btn-secondary"
              disabled={remove.isPending}
            >
              Giữ lại
            </AlertDialogCancel>
            <Button
              className="btn btn-danger"
              disabled={remove.isPending || !word}
              onClick={() => {
                if (word) remove.mutate(word.id, { onSuccess: dialog.close })
              }}
            >
              {remove.isPending ? 'Đang xóa…' : 'Xác nhận xóa'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
