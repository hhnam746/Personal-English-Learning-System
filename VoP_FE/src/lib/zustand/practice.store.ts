import { create } from 'zustand'
import { persist } from 'zustand/middleware'
export const usePracticeStore = create<{
  sessionId: string
  setSession: (id: string) => void
}>()(
  persist(
    (set) => ({ sessionId: '', setSession: (sessionId) => set({ sessionId }) }),
    { name: 'vop-active-practice' }
  )
)
