import type { RouteObject } from 'react-router-dom'
import WorkspaceLayout from '@/layouts/workspace.layout'
import { ProtectedRoute } from '@/features/auth/components/protected-route'
import { Link } from 'react-router-dom'

export const publicRoutes: RouteObject[] = [
  {
    path: 'login',
    lazy: async () => ({
      Component: (await import('@/features/auth/pages/login.page')).default
    })
  },
  {
    path: 'register',
    lazy: async () => ({
      Component: (await import('@/features/auth/pages/register.page')).default
    })
  },
  {
    element: (
      <ProtectedRoute>
        <WorkspaceLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/pages/dashboard.page')).default
        })
      },
      {
        path: 'library',
        lazy: async () => ({
          Component: (await import('@/pages/library.page')).default
        })
      },
      {
        path: 'practice',
        lazy: async () => ({
          Component: (await import('@/pages/practice.page')).default
        })
      },
      {
        path: 'flashcards',
        lazy: async () => ({
          Component: (await import('@/pages/flashcards.page')).default
        })
      },
      {
        path: 'progress',
        lazy: async () => ({
          Component: (await import('@/pages/progress.page')).default
        })
      },
      {
        path: '*',
        element: (
          <section className="empty-state">
            <h1>Không tìm thấy trang</h1>
            <Link to="/">Về Tổng quan</Link>
          </section>
        )
      }
    ]
  }
]
