import { Suspense } from 'react'
import { LoadingState } from '@/components/query-state'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import ReactQueryProvider from '@/lib/react-query'

export default function AppLayout() {
  return (
    <ReactQueryProvider>
      <Suspense fallback={<LoadingState />}>
        <Outlet />
      </Suspense>
      <Toaster position="top-right" />
    </ReactQueryProvider>
  )
}
