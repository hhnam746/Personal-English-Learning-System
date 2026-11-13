import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
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
  const [discard, setDiscard] = useState(false)
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
  const query = useVocabulary(dialog.editId || dialog.detailId)
  const { save, remove } = useVocabularyMutations()
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (save.isPending || remove.isPending) {
      blocker.reset()
      return
    }
  }, [blocker, save.isPending, remove.isPending])
  const word = query.data
  const confirm = dialog.deleteRequested
  const setConfirm = (value: boolean) => {
    if (value && word) dialog.openDelete(word.id)
    else dialog.cancelDelete()
  }
  const editing = dialog.create || !!dialog.editId
  const open = editing || !!dialog.detailId
  const close = () => {
    if (!save.isPending && !remove.isPending) {
      if (dirty.current) {
        discardOpener.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null
        setDiscard(true)
        return
      }
      dirty.current = false
      dialog.close()
    }
  }
  return (
    <>
      <AlertDialog
        open={
          discard ||
          (blocker.state === 'blocked' && !save.isPending && !remove.isPending)
        }
        onOpenChange={(value) => {
          if (!value) {
            setDiscard(false)
            if (dirty.current && blocker.state === 'blocked') blocker.reset()
          }
        }}
      >
        <AlertDialogContent
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
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <Button
              className="btn btn-danger"
              onClick={() => {
                dirty.current = false
                setDiscard(false)
                if (blocker.state === 'blocked') blocker.proceed()
                else dialog.close()
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
          if (!v) close()
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
                ? 'Nhập từ tiếng Anh và nghĩa tiếng Việt.'
                : 'Cập nhật nội dung, giữ lại tiến độ ghi nhớ.'
              : 'Nghĩa, phát âm và ví dụ của từ đã lưu.'}
          </DialogDescription>
          {!dialog.create && query.isPending ? (
            <LoadingState />
          ) : !dialog.create && query.isError ? (
            <ErrorState
              error={query.error}
              retry={() => void query.refetch()}
            />
          ) : editing ? (
            <VocabularyForm
              key={dialog.editId || 'new'}
              word={dialog.editId ? word : undefined}
              pending={save.isPending}
              onDirtyChange={setDirty}
              onSave={async (data) => {
                await save.mutateAsync({ id: dialog.editId || undefined, data })
                dirty.current = false
                dialog.close()
              }}
            />
          ) : (
            word && (
              <div className="word-detail">
                <div className="detail-title">
                  <span>{word.ipa || 'Chưa có IPA'}</span>
                  <SpeakButton term={word.term} audioUrl={word.audioUrl} />
                </div>
                <span className={`level-tag level-${word.level}`}>
                  {word.level ? `Level ${word.level}` : 'Chưa học'}
                </span>
                {word.meanings.map((m, i) => (
                  <section key={m.id || i}>
                    <h3>{m.meaningVi}</h3>
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
                <div className="form-actions">
                  <Button
                    className="btn btn-secondary"
                    onClick={() => setConfirm(true)}
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
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={confirm && !!word}
        onOpenChange={(v) => {
          if (!remove.isPending) setConfirm(v)
        }}
      >
        <AlertDialogContent className="vop-dialog">
          <AlertDialogTitle>Xóa “{word?.term}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Từ bị loại khỏi kho. Lịch sử học đã ghi nhận vẫn được giữ lại.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Giữ lại
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (word)
                  remove.mutate(word.id, {
                    onSuccess: () => {
                      setConfirm(false)
                      dialog.close()
                    }
                  })
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
