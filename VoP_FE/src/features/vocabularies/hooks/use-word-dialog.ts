import { useSearchParams } from 'react-router-dom'
export function useWordDialog() {
  const [params, setParams] = useSearchParams()
  const open = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    ;['new', 'word', 'edit', 'delete'].forEach((k) => next.delete(k))
    next.set(key, value)
    setParams(next)
  }
  const close = () => {
    const next = new URLSearchParams(params)
    ;['new', 'word', 'edit', 'delete'].forEach((k) => next.delete(k))
    setParams(next, { replace: true })
  }
  return {
    deleteId: params.get('delete') || '',
    cancelDelete: () => {
      const next = new URLSearchParams(params)
      next.delete('delete')
      setParams(next, { replace: true })
    },
    openDelete: (id: string) => {
      if (params.get('word') !== id) {
        open('delete', id)
        return
      }
      const next = new URLSearchParams(params)
      next.set('delete', id)
      setParams(next)
    },
    create: params.has('new'),
    detailId: params.get('word') || '',
    editId: params.get('edit') || '',
    openCreate: () => open('new', '1'),
    openDetail: (id: string) => open('word', id),
    openEdit: (id: string) => open('edit', id),
    close
  }
}
