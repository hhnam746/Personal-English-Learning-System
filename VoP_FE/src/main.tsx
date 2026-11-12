import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoadingState } from '@/components/query-state'
import AppLayout from '@/layouts/app.layout'
import { publicRoutes } from '@/routes/public.route'
import './index.css'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    hydrateFallbackElement: <LoadingState />,
    children: publicRoutes
  }
])
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
