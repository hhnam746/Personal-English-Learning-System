import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TargetLanguage = 'en' | 'ja' | 'es' | 'it'

export interface LanguageOption {
  code: TargetLanguage
  label: string
  flag: string
  sublabel: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'Tiếng Anh', flag: '🇬🇧', sublabel: 'English' },
  { code: 'ja', label: 'Tiếng Nhật', flag: '🇯🇵', sublabel: '日本語 (Kanji/Kana)' },
  { code: 'es', label: 'Tiếng Tây Ban Nha', flag: '🇪🇸', sublabel: 'Español' },
  { code: 'it', label: 'Tiếng Ý', flag: '🇮🇹', sublabel: 'Italiano' }
]

interface LanguageState {
  currentLanguage: TargetLanguage
  setLanguage: (lang: TargetLanguage) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      currentLanguage: 'en',
      setLanguage: (currentLanguage) => set({ currentLanguage })
    }),
    {
      name: 'vop-target-language'
    }
  )
)
