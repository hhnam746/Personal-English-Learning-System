import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  initialize: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({ loading: false })
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session, user: session?.user ?? null, loading: false })

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null, loading: false })
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Auth initialization failed',
        loading: false
      })
    }
  },

  signInWithGoogle: async () => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase is not configured') }
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      if (error) set({ error: error.message })
      return { error }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Google sign in failed')
      set({ error: error.message })
      return { error }
    }
  },

  signInWithEmail: async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase is not configured') }
    }
    try {
      set({ loading: true, error: null })
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        set({ error: error.message, loading: false })
        return { error }
      }
      set({ session: data.session, user: data.user, loading: false })
      return { error: null }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed')
      set({ error: error.message, loading: false })
      return { error }
    }
  },

  signUpWithEmail: async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase is not configured') }
    }
    try {
      set({ loading: true, error: null })
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        set({ error: error.message, loading: false })
        return { error }
      }
      set({ session: data.session, user: data.user, loading: false })
      return { error: null }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed')
      set({ error: error.message, loading: false })
      return { error }
    }
  },

  signOut: async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
    set({ user: null, session: null, error: null })
  }
}))
