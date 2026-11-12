import { useSearchParams } from 'react-router-dom'
export function useWordDialog() {
  const [params, setParams] = useSearchParams()
  const open = (key: string, value: string, deleting = false) => {
    const next = new URLSearchParams(params)
    ;['new', 'word', 'edit', 'delete'].forEach((k) => next.delete(k))
    next.set(key, value)
    if (deleting) next.set('delete', '1')
    setParams(next)
  }
  const close = () => {
    const next = new URLSearchParams(params)
    ;['new', 'word', 'edit', 'delete'].forEach((k) => next.delete(k))
    setParams(next, { replace: true })
  }
  return {
    deleteRequested: params.has('delete'),
    cancelDelete: () => {
      const next = new URLSearchParams(params)
      next.delete('delete')
      setParams(next, { replace: true })
    },
    openDelete: (id: string) => open('word', id, true),
    create: params.has('new'),
    detailId: params.get('word') || '',
    editId: params.get('edit') || '',
    openCreate: () => open('new', '1'),
    openDetail: (id: string) => open('word', id),
    openEdit: (id: string) => open('edit', id),
    close
  }
}
