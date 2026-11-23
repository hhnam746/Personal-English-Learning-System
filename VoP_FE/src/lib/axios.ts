import axios from 'axios'
import { supabase, isSupabaseConfigured } from './supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15_000
})

api.interceptors.request.use(async (config) => {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session?.access_token) {
        config.headers.Authorization = `Bearer ${data.session.access_token}`
      }
    } catch {
      // Continue without token if session check fails
    }
  }
  return config
})
