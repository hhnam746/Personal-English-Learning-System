import { Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import { AnimateUIProvider } from '@animate-ui/react/provider'
import { LoadingState } from '@/components/query-state'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import ReactQueryProvider from '@/lib/react-query'

export default function AppLayout() {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      <AnimateUIProvider reducedMotion="user">
        <ReactQueryProvider>
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
          <Toaster position="top-right" />
        </ReactQueryProvider>
      </AnimateUIProvider>
    </MotionConfig>
  )
}
