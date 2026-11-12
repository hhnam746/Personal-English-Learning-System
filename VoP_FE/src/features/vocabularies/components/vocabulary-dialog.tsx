import { useCallback, useEffect, useRef } from 'react'
import { useBlocker, useBeforeUnload } from 'react-router-dom'
import {
  Dialog,
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
  const dirty = useRef(false)
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
    if (window.confirm('Bỏ thay đổi chưa lưu?')) {
      dirty.current = false
      blocker.proceed()
    } else blocker.reset()
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
      if (
        dirty.current &&
        !window.confirm('Đóng biểu mẫu? Nội dung chưa lưu sẽ bị mất.')
      )
        return
      dirty.current = false
      dialog.close()
    }
  }
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) close()
        }}
      >
        <DialogContent className="vop-dialog">
          <DialogTitle>
            {editing
              ? dialog.create
                ? 'Thêm từ mới'
                : 'Sửa từ vựng'
              : word?.term || 'Chi tiết từ vựng'}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? 'Từ tiếng Anh và nghĩa tiếng Việt thuộc kho từ của bạn.'
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
              onCancel={() => {
                dirty.current = false
                dialog.close()
              }}
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
